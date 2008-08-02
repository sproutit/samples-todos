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

  /**
    Action called when the user presses the Add button.  
    
    Creates a new task and adds it to the end of the current array of tasks.
    Also puts the new task view into edit mode so the user can edit it.
  */
  addTask: function() {
    
    // Create a new task, with a default title.  
    // We use newRecord() here because it will add it to the store by default.
    var task = Todos.Task.newRecord({
      title: 'Untitled'
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
    
  }
    
}) ;
