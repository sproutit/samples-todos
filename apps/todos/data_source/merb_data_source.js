// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  TODO: Describe Class
  
  @extends SC.DataSource
  @since SproutCore 1.0
*/

SC.MerbDataSource = SC.DataSource.extend( {

  // ..........................................................
  // STANDARD DATA SOURCE METHODS
  // 
  
  cache:{},
  
  canceledStoreKeys:{},
  
  /**
     Invoked by the store whenever it needs to retrieve an array of records.

     @param {SC.Store} store the requesting store
     @param {SC.Array} the array with the storeKeys to be retrieved
     @returns {SC.Bool} return YES because Fixtures supports the function.  
  */
  retrieveRecords: function(store, storeKeys) {
    var len = storeKeys.length, dataHash, storeKey, i, id;
    var c=this.get('cache');
    if(!c) return YES;
    for(i=0; i<len; i++){
      storeKey = storeKeys[i];
      id = store.idFor(storeKey);
      if(!id) continue;
      dataHash = c[id];  
      if (dataHash) store.dataSourceDidComplete(storeKey, dataHash);
    }
    return YES;    
  },

  /**
    Invoked by the store whenever it needs to retrieve an array of storeKeys
    matching a specific query.  For the fixtures params are ignored and all 
    storeKeys for the specific recordType are returned.
    
    @param {SC.Store} store the requesting store
    @param {Object} recordType key describing the request, may be SC.Record
    @param {Hash} params optional additonal fetch params
    @returns {SC.Array} result set with storeKeys.  May be sparse.
  */
  fetchRecords: function(store, recordType, params) {
    var ret=[], dataHashes, i, storeKey;
    this.recsFor(ret, recordType, params);
    return ret;
  },
  
  /**
    Fixture operations complete immediately so you cannot cancel them.
  */
  cancel: function(store, storeKeys) {
    var i;
    for(i in storeKeys){
      store.dataSourceDidCancel(storeKeys[i]);
      this.canceledStoreKeys[storeKeys[i]]=YES;
    }
    return YES;
  },
  
 /**
    Update the dataHash in this._fixtures
  */
  updateRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        dataHash   = store.readDataHash(storeKey), 
        c=this.get('cache'),
        ds=this;
    
    var request = SC.Request.create() ;
    request = SC.Request.putUrl("tasks", dataHash) ;
    request.set("isJSON", true);
  	request.addObserver("response", function(r) {
      ds.updateRecordDidComplete(r, store, storeKey, id) ;
    });
    request.send();
    
    return YES ;
  },


  /**
    Adds records to this._fixtures.  If the record does not have an id yet,
    then then calls generateIdFor() and sets that.
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if successful
  */
  createRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        dataHash   = store.readDataHash(storeKey), 
        c=this.get('cache'),
        ds=this, request, obj;
    obj = {"content":dataHash};
    request = SC.Request.create() ;
    request = SC.Request.postUrl("tasks", SC.json.encode(obj)) ;
    request.set("isJSON", true);
  	request.addObserver("response", function(r) {
      ds.createRecordDidComplete(r, store, storeKey, id) ;
    });
    request.send();
    
    return YES ;
  },

  /**
    Removes the data from the fixtures.  
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if successful
  */
  destroyRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        c          = this.get('cache'),
        ds=this, request;
    
    if(!id) return YES;
  	request = SC.Request.create() ;
    request = SC.Request.deleteUrl(id) ;
    request.set("isJSON", true);
    request.addObserver("response", function(r) {
      ds.destroyRecordDidComplete(r, store, storeKey, id);
    });
    request.send();

    return YES ;
  },
  
  // internal
  
  recsFor: function(ret, recordType, params) {
    var url, request, paramslen, ds;
    ds=this;
    if(params === undefined || params === null || params.length===0) {
      url = "tasks";
      request = SC.Request.getUrl(url) ;
      request.set("isJSON", true);
      request.addObserver("response", function(r) {
        ds.recsForDidComplete(r, ret, recordType, params);
      }); 
      request.send();
      
    }else{
      paramslen = params.length;
      for(var i=0; i< paramslen; i++){
        url="tasks/"+params[0];
        request.set("isJSON", true);
        request.addObserver("response", function(r) {
          ds.recsForDidComplete(r, ret, recordType, params);
        });
        request.send();
      }
    }
    return this;
  },
  
  
  // callback methods
 
  
  recsForDidComplete: function(r, ret, recordType, params){
    var results, lenresults, response, dataHash, idx, storeKey, storeKeys=[];
    var primaryKey = recordType ? recordType.prototype.primaryKey : 'guid';
    
    response = r.response();
    results = response.content;
    lenresults=results.length;
    if(!lenresults){
    	dataHash = results;
      storeKey = this.storeResultInCache(dataHash, recordType, primaryKey);
      storeKeys.push(storeKey);
    }else{
    	for(idx=0;idx<lenresults;idx++) {      
      	dataHash = results[idx];
      	storeKey = this.storeResultInCache(dataHash, recordType, primaryKey);
        storeKeys.push(storeKey);
    	}
    } 
    ret.replace(0,0,storeKeys);
  },
  
  createRecordDidComplete: function(r, store, storeKey, id){
    var c=this.get('cache'), dataHash, response, results, guid;
    dataHash = store.readDataHash(storeKey);
    response = r.response();
    results = response.content;
    guid=results.guid;
    if(guid) c[guid]=results;
    store.dataSourceDidComplete(storeKey, results, guid);
  },
  
  updateRecordDidComplete: function(r, store, storeKey, id){
    var c=this.get('cache'), dataHash, response, results, guid;
    dataHash = store.readDataHash(storeKey);
    response = r.response();
    results = response.content;
    guid=results.guid;
    if(guid) c[guid]=results;
    store.dataSourceDidComplete(storeKey, results, guid);
  },
  
  destroyRecordDidComplete: function(r, store, storeKey, id){
    var c=this.get('cache');
    if (id) delete c[id];
    store.dataSourceDidDestroy(storeKey);
  },
  
  storeResultInCache: function(dataHash, recordType, primaryKey) {
    var id, storeKey, c;
    c = this.get('cache');
    id = dataHash[primaryKey];
    storeKey = recordType.storeKeyFor(id);
    c[dataHash[primaryKey]] = dataHash;
    return storeKey;
  },
  
  /**
     Generates an id for the passed record type.  You can override this if 
     needed.  The default generates a storekey and formats it as a string.
   */
   generateIdFor: function(recordType, dataHash, store, storeKey) {
     return "@id%@".fmt(SC.Store.generateStoreKey());
   },
   
   removedStoreKeyFromCanceledKeys : function(storeKey){
     delete this.canceledStoreKeys[storeKey];
   },
   
   removedStoreKeysFromCanceledKeys : function(storeKeys){
     var i;
      for(i in storeKeys){
        delete this.canceledStoreKeys[storeKeys[i]];
      }
    }
  
});

var merbServer=SC.MerbDataSource.create();

