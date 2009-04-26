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
  
  canceledStoreKeys:{},
  
  /**
    Invoked by the store whenever it needs to retrieve an array of storeKeys
    matching a specific query.  For the fixtures params are ignored and all 
    storeKeys for the specific recordType are returned.
    
    @param {SC.Store} store the requesting store
    @param {Object} recordType key describing the request, may be SC.Record
    @param {Hash} params optional additonal fetch params
    @returns {SC.Array} result set with storeKeys.  May be sparse.
  */
  fetchRecords: function(store, fetchKey, params) {
    
    if (fetchKey === SC.Record.STORE_KEYS) {
      params.forEach(function(storeKey) {
        var recordType = SC.Store.recordTypeFor(storeKey),
            id = recordType.idFor(storeKey);
        // get request...
      }, this);
      ret = params ;
    } else {
      var ret = [];
      this.recsFor(ret, fetchKey, params);
      return ret ;
    }
    return ret;
  },
  
  /**
    Fixture operations complete immediately so you cannot cancel them.
  */
  cancel: function(store, storeKeys) {
    // CAJ: this is a little off.  I think a better approach here would be
    // to keep a hash of inflight operations, sorted by storeKey.  You then
    // cancel the Ajax request for the storeKey and remove the storeKey from
    // the queue so that any response will simply drop on the floor
    var i;
    for(i in storeKeys){
      store.dataSourceDidCancel(storeKeys[i]);
      this.canceledStoreKeys[storeKeys[i]]=YES;
    }
    return YES;
  },

  updateRequest: SC.Request.putUrl("tasks").set('isJSON', YES),
  
 /**
    CAJ: description looks wrong?
    
    Update the dataHash in this._fixtures
  */
  updateRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        dataHash   = store.readDataHash(storeKey);
        
    // var request  ;
    //     request = SC.Request.putUrl("tasks", dataHash) ;
    //     request.set("isJSON", true);
    //    request.addObserver("response", function(r) {
    //       ds.updateRecordDidComplete(r, store, storeKey, id) ;
    //     });
    //     request.send();
    //     
    // CAJ: Request is designed to be chained.  Also there is a notify() 
    // helper that can replace addObserver().  Looking at SC.Request is 
    // appears notify() is not fully implemented.  Can you do that?  Here 
    // is what this code should look like:
    this.updateRequest.notify(this, this.updateRecordDidComplete, { 
      store: store, storeKey: storeKey 
    }).send(dataHash);
      
    return YES ;
  },


  createRequest: SC.Request.postUrl("tasks").set('isJSON', YES),
  
  /**
  CAJ: description looks wrong?
  
    Adds records to this._fixtures.  If the record does not have an id yet,
    then then calls generateIdFor() and sets that.
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if successful
  */
  createRecord: function(store, storeKey) {
    var dataHash   = store.readDataHash(storeKey), 
        obj;
        
    obj = {"content":dataHash};
    this.createRequest.notify(this, this.createRecordDidComplete, { 
      store: store, storeKey: storeKey 
    }).send(obj);
    
    return YES ;
  },

  destroyRequest: SC.Request.deleteUrl("").set('isJSON', YES),
  /**
    Removes the data from the fixtures.  
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if successful
  */
  destroyRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey);
        
    if(!id) return YES;
  	this.destroyRequest.set('address',id) ;
    this.destroyRequest.notify(this, this.destroyRecordDidComplete, { 
      store: store, storeKey: storeKey 
    }).send();
    
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
    if(!this.canceledStoreKeys[storeKey]) return NO;
    dataHash = store.readDataHash(storeKey);
    response = r.response();
    results = response.content;
    guid=results.guid;
    if(guid) c[guid]=results;
    store.dataSourceDidComplete(storeKey, results, guid);
    return YES;
  },
  
  updateRecordDidComplete: function(r, store, storeKey, id){
    var c=this.get('cache'), dataHash, response, results, guid;
    if(!this.canceledStoreKeys[storeKey]) return NO;
    dataHash = store.readDataHash(storeKey);
    response = r.response();
    results = response.content;
    guid=results.guid;
    if(guid) c[guid]=results;
    store.dataSourceDidComplete(storeKey, results, guid);
    return YES;
  },
  
  destroyRecordDidComplete: function(r, store, storeKey, id){
    var c=this.get('cache');
    if(!this.canceledStoreKeys[storeKey]) return NO;
    if (id) delete c[id];
    store.dataSourceDidDestroy(storeKey);
    return YES;
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
   
   removedStoreKeyFromCanceled : function(storeKey){
     delete this.canceledStoreKeys[storeKey];
   },
   
   removedStoreKeysFromCanceled : function(storeKeys){
     var i;
      for(i in storeKeys){
        delete this.canceledStoreKeys[storeKeys[i]];
      }
    }
  
});

var merbServer=SC.MerbDataSource.create();

