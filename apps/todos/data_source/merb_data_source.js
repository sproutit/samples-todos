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
  
  requestCounter:0,
  cancelStoreKeys:{},

  fetchRequest: SC.Request.getUrl("").set('isJSON', YES),
  
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

    var ret = [], url;
    if (fetchKey === SC.Record.STORE_KEYS) {
      params.forEach(function(storeKey) {
        var recordType = SC.Store.recordTypeFor(storeKey),
            id = recordType.idFor(storeKey);
        url='tasks/'+id;
        this.fetchRequest.set('address', url);
        this.fetchRequest.notify(this, this.fetchRecordDidComplete, { 
          store: store, fetchKey: fetchKey , storeKey: storeKey, id:id
        }).send();
        this.cancelStoreKeys[this.generateRequestId(storeKey)]=this.fetchRequest;
      }, this);
      ret = params ;
    } else {
      url='tasks';
      this.fetchRequest.set('address', url);
      this.fetchRequest.notify(this, this.fetchAllRecordsDidComplete, { 
        store: store, fetchKey: fetchKey , storeKeyArray: ret
      }).send();
    }
    return ret;
  },
  
  /**
    Removes the request from the queue if it is cancelled.
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if supported
  */
  cancel: function(store, storeKeys) {
    // TODO: The request manager should have methods to cancel request that are 
    // in the queue or are being procesed, instead of accesing directly the queue
    // In case that a connection hangs there is no option to abort it.
    var i, j;
    for (i in storeKeys) {
      for (j in this.cancelStoreKeys) {
        if (i.indexOf(j) != -1) {
          SC.Request.manager.get('queue').removeObject(this.cancelStoreKeys[j]);
          this.cancelStoreKeys[j]=null;
        }
      }
    }
    return YES;
  },

 
  createRequest: SC.Request.postUrl("tasks").set('isJSON', YES),
  /**
    Issues a request to create a record using the hash corresponding to the
    storeKey
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if supported
  */
  createRecord: function(store, storeKey) {
    debugger;
    var dataHash   = store.readDataHash(storeKey), 
        obj={"content":dataHash};
    this.createRequest.notify(this, this.createRecordDidComplete, { 
      store: store, storeKey: storeKey 
    }).send(SC.json.encode(obj));
    this.cancelStoreKeys[this.generateRequestId(storeKey)]=this.createRequest;
    return YES ;
  },
  updateRequest: SC.Request.putUrl("tasks").set('isJSON', YES),
  
 /**
    Issues a request to update the record corresponding to the storeKey.
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if supported
  */
  updateRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        dataHash   = store.readDataHash(storeKey);
        
    this.updateRequest.notify(this, this.updateRecordDidComplete, { 
      store: store, storeKey: storeKey, id:id
    }).send(SC.json.encode(dataHash));
    this.cancelStoreKeys[this.generateRequestId(storeKey)]=this.updateRequest;  
    return YES ;
  },


  
  
  destroyRequest: SC.Request.deleteUrl("").set('isJSON', YES),
  /**
    Issues a request to delete the record corresponding to the storeKey
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if supported
  */
  destroyRecord: function(store, storeKey) {
    var id         = store.idFor(storeKey);
        
    if(!id) return YES;
  	this.destroyRequest.set('address',id) ;
    this.destroyRequest.notify(this, this.destroyRecordDidComplete, { 
      store: store, storeKey: storeKey 
    }).send();
    this.cancelStoreKeys[this.generateRequestId(storeKey)]=this.destroyRequest;
    return YES ;
  }, 
  
  // callback methods
  
  /**
    Once the fetch request commint from store.retrieveRecords()
    is completed it handles the response and updates the store
    
    @param {SC.Request} fetch request
    @param {Object} hash with parameters {params.storeKey, params.store}
    @returns {Boolean} YES 
  */
 
  fetchRecordDidComplete: function(r,params) {
    var response, results, dataHash, storeKeys = [], hashes = [];
    response = r.response();
    results = response.content;
    dataHash = results;
    hashes.push(dataHash);
    storeKeys.push(params.storeKey);
    params.store.dataSourceDidComplete(params.storeKey, dataHash, params.id);    
    params.storeKeyArray.replace(0,0,storeKeys);  
    return YES;
  },
  
  
  /**
    Once the fetch request comming from store.findAll()
    is completed it handles the response and updates the store
    
    @param {SC.Request} fetch request
    @param {Object} hash with parameters {params.store}
    @returns {Boolean} YES 
  */
  fetchAllRecordsDidComplete: function(r,params) {
    var hashes= [], storeKeys= [], dataHash, store, fetchKey, ret, primaryKey,
    response, results, lenresults, idx;
    fetchKey = params.fetchKey;
    primaryKey = fetchKey ? fetchKey.prototype.primaryKey : 'guid';
    response = r.response();
    results = response.content;
    lenresults=results.length;
    for(idx=0;idx<lenresults;idx++) {      
      dataHash = results[idx];
      hashes.push(dataHash); 
    } 
    storeKeys = params.store.loadRecords(fetchKey, hashes);
    params.storeKeyArray.replace(0,0,storeKeys);
    //TODO: add error handling
    return YES;
  },
  
  
  /**
    Once the create request is completed it handles the response and updates the store
    
    @param {SC.Request} fetch request
    @param {Object} hash with parameters {params.storeKey, params.store}
    @returns {Boolean} YES 
  */
  
  createRecordDidComplete: function(r, params){
    var dataHash, response, results, guid;
    dataHash = params.store.readDataHash(params.storeKey);
    response = r.response();
    results = response.content;
    guid=results.guid;
    params.store.dataSourceDidComplete(params.storeKey, results, guid);
    return YES;
  },
  
  
  /**
    Once the update request is completed it handles the response and updates the store
    
    @param {SC.Request} destroy request
    @param {Object} hash with parameters {params.storeKey, params.store, params.id}
    @returns {Boolean} YES 
  */
  updateRecordDidComplete: function(r, params){
    var dataHash, response, results;
    dataHash = params.store.readDataHash(params.storeKey);
    response = r.response();
    results = response.content;
    params.store.dataSourceDidComplete(params.storeKey, results, params.id);
    return YES;
  },
  
  
  /**
    Once the destroy request is completed it handles the response and updates the store
    
    @param {SC.Request} destroy request
    @param {Object} hash with parameters {params.storeKey, params.store}
    @returns {Boolean} YES 
  */
  destroyRecordDidComplete: function(r, params){
    params.store.dataSourceDidDestroy(params.storeKey);
    return YES;
  },
  
  
  /**
     Generates an id for the passed record type.  You can override this if 
     needed.  The default generates a storekey and formats it as a string.
   */
   generateIdFor: function(recordType, dataHash, store, storeKey) {
     return "@id%@".fmt(SC.Store.generateStoreKey());
   },
   
   
   generateRequestId: function(storeKey){
     this.requestCounter++;
     return storeKey+"_"+this.requestCounter;
   }
   
  
});

var merbServer=SC.MerbDataSource.create();

