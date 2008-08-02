// ==========================================================================
// Todos.ServerController
// ==========================================================================

require('core');

/** @class

  This controller manages the list of tasks you want to show in your UI.

  @extends SC.ArrayController
  @static
*/
Todos.serverController = SC.Object.create(
/** @scope Todos.serverController */ {
  
  loadTasks: function() {
    new Ajax.Request('/tasks.json', {
      method: 'get',
      onSuccess: this._loadTasksDidSucceed,
      onFailure: this._loadTasksDidFail
    }) ;
  },

  _loadTasksDidSucceed: function(transport) {
    var json = transport.responseJSON;
    if (!json) return this._loadTasksDidFail(transport) ;

    // Load records...
    var records = json.content ;
    records = SC.Store.updateRecords(records, SC.Store, Todos.Task) ;
    
    // Sort records based on their sort order or title.
    records = records.sort(function(a,b) {
      var orderA = a.get('order') ;
      var orderB = b.get('order') ;
      if (orderA === orderB) { 
        var titleA = a.get('title') ;
        var titleB = b.get('title') ;
        return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0 ;
      } else return (orderA < orderB) ? -1 : (orderA > orderB) ? 1 : 0 ;
    }) ;
    
    // Set as new content array.
    Todos.tasksController.set('content', records) ;
  },
  
  _loadTasksDidFail: function() {
    console.log('oops. failed!') ;
  },
  
  createRecord: function(rec) {
    var req = new Ajax.Request('/tasks.json', {
      method: 'post',
      onSuccess: this._createRecordDidSucceed,
      onFailure: this._createRecordDidFail,
      contentType: 'application/json',
      postBody: Object.toJSONString({ content: rec.get('attributes') })
    }) ;
    req.record = rec ;
    rec.set('isCommitting', YES) ;
  },
  
  _createRecordDidSucceed: function(transport) {
    var guid = transport.getHeader('Location') ;
    var record = transport.request.record ;
    
    transport.request.record = null ; // avoid leaks
    SC.Store.relocateRecord(record.get('guid'), guid, record) ;
    record.set('guid', guid) ;
    record.set('newRecord', NO) ;
    record.set('isCommitting', NO) ;
  },

  _createRecordDidFail: function(transport) {
    console.log("oops failed!") ;
    transport.request.record.set('isCommitting', NO) ;
    transport.request.record = null ;
  },

  commitRecord: function(rec) {
    var req = new Ajax.Request(rec.get('guid'), {
      method: 'put',
      onSuccess: this._commitRecordDidSucceed,
      onFailure: this._commitRecordDidFail,
      contentType: 'application/json',
      postBody: Object.toJSONString({ content: rec.get('attributes') })
    }) ;
    req.record = rec ;
    rec.set('isCommitting', YES) ;
  },
  
  _commitRecordDidSucceed: function(transport) {
    transport.request.record.set('isCommitting', NO) ;
    transport.request.record = null ;
  },

  _commitRecordDidFail: function(transport) {
    console.log("oops failed!") ;
    transport.request.record.set('isCommitting', NO) ;
    transport.request.record = null ;
  },

  destroyRecord: function(rec) {
    var req = new Ajax.Request(rec.get('guid'), { method: 'delete' }) ;
  }
  

}) ;
