// ==========================================================================
// Todos.TasksController
// ==========================================================================

require('core');

/** @class

  This controller manages the list of tasks you want to show in your UI.

  @extends SC.ArrayController
  @static
*/
Todos.tasksController = SC.ArrayController.create(
/** @scope Todos.tasksController */ {

  destroyOnRemoval: YES,
  
  /**
    Action called when the user presses the Add button.  
    
    Creates a new task and adds it to the end of the current array of tasks.
    Also puts the new task view into edit mode so the user can edit it.
  */
  addTask: function() {
    
    // Create a new task, with a default title.  
    // We use newRecord() here because it will add it to the store by default.
    var task = Todos.Task.newRecord({
      title: 'Untitled',
      order: this.get('length')
    }) ;
    
    // Add the task to the end of the current array.  Note that we use the
    // SC.Array method, since this is observable.
    this.pushObject(task) ;

    // Now, we need to get the item view for the new task from the list view.
    // Since the the task list has not yet had a chance to update with the new
    // content, we do this the next runloop.

    // Find the list view from the page.
    var listView = SC.page.getPath('todos.taskListScrollView.taskList') ;
    var itemView = listView.itemViewForContent(task) ;

    // Begin editing on the found itemView.
    itemView.beginEditing() ;
  },
  
  /**
    Action called when the user presses the Delete button.
    
    Calls destroy on any selected tasks and removes them from the array.
  */
  deleteTask: function() {

    // get the selected tasks...
    var tasks = this.get('selection') ;

    // begin property changes.  This will avoid sending notifications to
    // observers until we are done making changes.
    this.beginPropertyChanges() ;
    
    // for each task, remove from the array and call destroy on the task
    var idx = tasks.get('length') ;
    while(--idx >= 0) {
      var task = tasks.objectAt(idx) ;
      this.removeObject(task) ;
    }
    
    // end property changes, this will allow change notifications to go out.
    this.endPropertyChanges() ;
  },
  
  /**
    @property
    
    This computed property changes to YES whenever the user has a non-empty
    selection.  This is bound to the Delete button to enable/disable it 
    automatically.
    
    Note that this property it dependent on the selection property.  This
    means the value of this property will change whenever the selection
    changes.
  */
  canDeleteTask: function() {
    var sel = this.get('selection') ;
    return (sel != null) && (sel.get('length') > 0) ;
  }.property('selection'),
  
  
  // whenever the array changes, make sure all the member items have the 
  // correct order...
  enumerableContentDidChange: function() {
    sc_super() ;
    
    var content = Array.from(this.get('content')) ;
    var len = content.get('length') ;
    for(var idx =0; idx < len; idx++) {
      var task = content.objectAt(idx) ;
      if (task.get('order') !== idx) task.set('order', idx) ;
    }
  }
    
}) ;
