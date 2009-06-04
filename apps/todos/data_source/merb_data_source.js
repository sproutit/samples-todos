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

  fetchRequest: SC.Request.getUrl("tasks").set('isJSON', YES),

  
  /**
    Invoked by the store whenever it needs to retrieve an array of storeKeys
    matching a specific query.  For the fixtures params are ignored and all 
    storeKeys for the specific recordType are returned.
    
    @param {SC.Store} store the requesting store
    @param {Object} recordType key describing the request, may be SC.Record
    @param {Hash} params optional additonal fetch params
    @returns {SC.Array} result set with storeKeys.  May be sparse.
  */
  fetch: function(store, fetchKey, params) {
    var ret = [], url;
    var action={};
    this.fetchRequest.notify(this, this.fetchDidComplete,
      { 
        store: store, 
        fetchKey: fetchKey , 
        storeKeyArray: ret
      }
    ).send();
    
    return ret;
  },
  
  
  retrieveRequest: SC.Request.getUrl("").set('isJSON', YES),
  /**
    Invoked by the store whenever it needs to retrieve an array of storeKeys
    matching a specific query.  For the fixtures params are ignored and all 
    storeKeys for the specific recordType are returned.
    
    @param {SC.Store} store the requesting store
    @param {Object} recordType key describing the request, may be SC.Record
    @param {Hash} params optional additonal fetch params
    @returns {SC.Array} result set with storeKeys.  May be sparse.
  */
  retrieveRecord: function(store, storeKey) {
    var ret = [], url, action={},
        recordType = SC.Store.recordTypeFor(storeKey),
        id = recordType.idFor(storeKey);
    url='tasks/'+id;
  
    this.retrieveRequest.set('address', url);
    this.retrieveRequest.notify(this, this.retrieveRecordDidComplete, 
        { store: store, storeKey: storeKey,id:id }
    ).send();
    
    this.cancelStoreKeys[storeKey]=[].push(this.retrieveRequest);
    return ret;
  },
  
  
  /**
    Removes the request from the queue if it is cancelled.
    
    @param {SC.Store} store the store
    @param {Number} storeKey the store key
    @returns {Boolean} YES if supported
  */
  cancel: function(store, storeKeys) {
    var i, requestArray;
    for (i in storeKeys) {
      requestArray=this.cancelStoreKeys[i];
      if(requestArray){
        while(requestArray.length>0){
          SC.Request.manager.removeRequest(this.cancelStoreKeys[i].pop());
          store.dataSourceDidCancel(i);
        }
      }
    }
    return YES;
  },
  
  cancelAll: function(store){
    var i;
    for(i in this.cancelStoreKeys){
      store.dataSourceDidCancel(i);
    }
    this.cancelStoreKeys={};
    SC.Request.manager.cancelAllRequests();
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
    var dataHash   = store.readDataHash(storeKey), 
        obj={"content":dataHash};
        
    this.createRequest.notify(this, this.createRecordDidComplete, 
      { 
        store: store, storeKey: storeKey 
      }
    ).send(obj);
    
    this.cancelStoreKeys[storeKey]=[].push(this.fetchRequest);
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
        
    this.updateRequest.notify(this, this.updateRecordDidComplete, 
      { 
        store: store, storeKey: storeKey, id:id
      }
    ).send(dataHash);
    
    this.cancelStoreKeys[storeKey]=[].push(this.fetchRequest);
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
    var id = store.idFor(storeKey);
        
    if(!id) return YES;
  	this.destroyRequest.set('address',id) ;
    this.destroyRequest.notify(this, this.destroyRecordDidComplete, 
      { 
        store: store, storeKey: storeKey 
      }
    ).send();
    
    this.cancelStoreKeys[storeKey]=[].push(this.fetchRequest);
    return YES ;
  }, 
  
  // callback methods
  
  /**
    Once the retrieve request comming from store.retrieveRecords()
    is completed it handles the response and updates the store
    
    @param {SC.Request} fetch request
    @param {Object} hash with parameters {params.storeKey, params.store}
    @returns {Boolean} YES 
  */
 
  retrieveRecordDidComplete: function(r,params) {
    var response, results, storeKeys = [], hashes = [];
    response = r.response();
    if(response.kindOf ? response.kindOf(SC.Error) : false){
     this.requestDidError(r);
    }else{
      results = response.content;
      storeKeys.push(params.storeKey);
      params.store.dataSourceDidComplete(params.storeKey, results, params.id);
      this.cancelStoreKeys[params.storeKey]=null;    
      params.storeKeyArray.replace(0,0,storeKeys);
    }  
    return YES;
  },
  
  
  /**
    Once the fetch request comming from store.findAll()
    is completed it handles the response and updates the store
    
    @param {SC.Request} fetch request
    @param {Object} hash with parameters {params.store}
    @returns {Boolean} YES 
  */
  fetchDidComplete: function(r,params) {
    var hashes= [], storeKeys= [], store, fetchKey, ret, primaryKey,
    response, results, lenresults, idx;
    response = r.response();
    if(response.kindOf ? response.kindOf(SC.Error) : false){
     this.requestDidError(r);
    }else{
      fetchKey = params.fetchKey;
      results = response.content; 
      storeKeys = params.store.loadRecords(fetchKey, results);
      params.storeKeyArray.replace(0,0,storeKeys);
    }
    return YES;
  },
  
  
  /**
    Once the create request is completed it handles the response and updates the store
    
    @param {SC.Request} fetch request
    @param {Object} hash with parameters {params.storeKey, params.store}
    @returns {Boolean} YES 
  */
  
  createRecordDidComplete: function(r, params){
    var response, results, guid;
    response = r.response();
    if(response.kindOf ? response.kindOf(SC.Error) : false){
      this.requestDidError(r);
    }else{
      results = response.content;
      guid=results.guid;
      params.store.dataSourceDidComplete(params.storeKey, results, guid);
      this.cancelStoreKeys[params.storeKey]=null;
    }
    return YES;
  },
  
  
  /**
    Once the update request is completed it handles the response and updates the store
    
    @param {SC.Request} destroy request
    @param {Object} hash with parameters {params.storeKey, params.store, params.id}
    @returns {Boolean} YES 
  */
  updateRecordDidComplete: function(r, params){
    var response, results;
    response = r.response();
    if(response.kindOf ? response.kindOf(SC.Error) : false){
     this.requestDidError(r);
    }else{
      results = response.content;
      params.store.dataSourceDidComplete(params.storeKey, results, params.id);
      this.cancelStoreKeys[params.storeKey]=null;
    }
    return YES;
  },
  
  
  /**
    Once the destroy request is completed it handles the response and updates the store
    
    @param {SC.Request} destroy request
    @param {Object} hash with parameters {params.storeKey, params.store}
    @returns {Boolean} YES 
  */
  destroyRecordDidComplete: function(r, params){
    var response = r.response();
    if(response.kindOf ? response.kindOf(SC.Error) : false){
     this.requestDidError(r);
    }else{
      params.store.dataSourceDidDestroy(params.storeKey);
      this.cancelStoreKeys[params.storeKey]=null;
    }
    return YES;
  },
  
  requestDidError: function(r){
    var pane = SC.AlertPane.error("There has been an error with your request", 
        r.get('rawResponse').toString(), '', "OK", "Cancel", this);      
    return YES;
  }
   
});
