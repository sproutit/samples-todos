// ==========================================================================
// Project:   Todos.tasksController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Todos */

/** @class

  (Document Your Controller Here)

  @extends SC.ArrayController
*/
Todos.tasksController = SC.ArrayController.create(
/** @scope Todos.tasksController.prototype */ {

	destroyOnRemoval: YES,

  summary: function() {
    var len = this.get('length'), sel = this.get('selection'), ret ;

    if (len && len > 0) {
      ret = len === 1 ? "1 task" : "%@ tasks".fmt(len);
    } else ret = "No tasks";
    
    if (sel && sel > 0) {
      ret = ret + " (%@ selected)".fmt(sel.get('length'));
    }
    return ret ;
  }.property('length', 'selection').cacheable(),
  
  addTask: function() {
    // Create a new task, with a default title.  
    // We use newRecord() here because it will add it to the store by default.
    var task = Todos.store.createRecord(Todos.Task, {title: 'Untitled', "isDone":false,"order":1});
    
    // Add the task to the end of the current array.  Note that we use the
    // SC.Array method, since this is observable.
    this.pushObject(task) ;
    debugger;
	  Todos.store.commitRecords();
    
    // Now, we need to get the item view for the new task from the list view.
    // Since the the task list has not yet had a chance to update with the new
    // content, we do this the next runloop.

    // Find the list view from the page.
    //var listView = Todos.mainPage.mainPane.middleView.contentView;
    //l=listView.get('content').length();
    /*for (var j=0; j<l; j++){
    	if(listView.itemViewAtContentIndex(j).get('content').get('storeKey')==task.get('storeKey')){
    		listView.itemViewAtContentIndex(j).beginEditing();
    	}
    }*/
    
    
//    var itemView = listView.itemViewForRecord(task) ;

    // Begin editing on the found itemView.
  //  itemView.beginEditing() ;
  },
  
  deleteTask: function() {
  
  	//get the selected tasks
  	var sel= this.get('selection');
  	var store=Todos.get('store');
	
	//pass the guids to be destroyed
  	store.destroyRecords(Todos.Task, sel.get('guid'));
  	//commit the operation to send the request to the server
  	store.commitRecords();
  }
  
  

}) ;
