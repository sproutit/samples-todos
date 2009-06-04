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
     var pane = SC.DialogPane.info("Set the name for your new task", 
          "here goes the field", '', "Add Task", "Cancel", this);      
      return YES;
  },
  
  dialogPaneDidAdd: function(name){
    var task = Todos.store.createRecord(Todos.Task, {title: name, "isDone":false,"order":1});
    
    this.pushObject(task) ;
    Todos.store.commitRecords();
    return YES;
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
