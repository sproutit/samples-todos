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
    var ret = [], dataHashes, i, storeKey;
    
    // only support tasks
    if (!(recordType === Todos.Task)) {
      return [] ;
    }
    var primaryKey = recordType ? recordType.prototype.primaryKey : 'guid';
    dataHashes = this.recsFor(recordType, params);
    c=this.get('cache');
    for(i in dataHashes){
      storeKey = recordType.storeKeyFor(i);
      ret.push(storeKey);
      c[dataHashes[i][primaryKey]]=dataHashes[i];
    }
    this.set('cache', c); 
    return ret;
  },
  
  /**
    Fixture operations complete immediately so you cannot cancel them.
  */
  cancel: function(store, storeKeys) {
    return NO;
  },
  
 /**
    Update the dataHash in this._fixtures
  */
  updateRecord: function(store, storeKey) {
    this.createRecord(store, storeKey);
    
    //this.setFixtureForStoreKey(store, storeKey, store.readDataHash(storeKey));
    //store.dataSourceDidComplete(storeKey);  
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
        recordType = store.recordTypeFor(storeKey),
        dataHash   = store.readDataHash(storeKey), 
        c=this.get('cache');
    
    var request = SC.Request.create() ;
    request.set('address', address) ;
  	request.set('type', 'PUT') ;
  	request.set('body', dataHash.toString()) ;
  	request.set("isAsynchronous", false);
    request.set("isJSON", true);
    request.send();
    
    if (!id) id = this.generateIdFor(recordType, dataHash, store, storeKey);
    c[id] = dataHash;

    store.dataSourceDidComplete(storeKey, null, id);
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
        recordType = store.recordTypeFor(storeKey),
    	c=this.get('cache');
    
    if(!id) return YES;
  	var request = SC.Request.create() ;
    request.set('address', id+".json") ;
  	request.set('type', 'DELETE') ;
  	request.set("isAsynchronous", false);
    request.set("isJSON", true);
    request.send();

    contents = request.get("response");
      
    if (id) delete c[id];
    
    store.dataSourceDidDestroy(storeKey);  
    return YES ;
  },
  
  // internal
  //	this is a rough version of this method
  // 	params are an array of guids... per guid passed, it would
  //	issue a request
  // 	-params support is not neccesary for the tutorial !!
  
  recsFor: function(recordType, params) {
    var url, recordHashes={}, contents ,request, results, lenresults, c;
    var primaryKey = recordType ? recordType.prototype.primaryKey : 'guid';
    if(params && params.length>1) {
      c=this.get('cache');
      for(var p=0; p<params.length; p++){
        dh=this.recsFor(recordType, [params[p]]);
        for(j in dh){
       		recordHashes[dh[j][primaryKey]]=dh[j];
      	}  	
      }
    }else{
      if(params === undefined || params === null || params.length==0) url = "tasks.json";
      else url="tasks/"+params[0]+".json";
       
      request = SC.Request.getUrl(url) ;
      request.set("isAsynchronous", false);
      request.set("isJSON", true);
      request.send();

      contents = request.get("response");
      results = contents.content;
      lenresults=results.length;
      if(!lenresults){
      	dataHash = results;
        id = dataHash[primaryKey];
        if (!id) id = this.generateIdFor(recordType, dataHash); 
        recordHashes[id] = dataHash;
      }else{
      	for(idx=0;idx<lenresults;idx++) {      
        	dataHash = results[idx];
        	id = dataHash[primaryKey];
        	if (!id) id = this.generateIdFor(recordType, dataHash); 
        	recordHashes[id] = dataHash;
      	}
      }
    }
    return recordHashes;
  }
});

var merbServer=SC.MerbDataSource.create();
