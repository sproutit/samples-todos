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

  summary: function() {
    var len = this.get('length'), ret ;

    if (len && len > 0) {
      ret = len === 1 ? "1 task" : "%@ tasks".fmt(len);
    } else ret = "No tasks";

    return ret;
  }.property('length').cacheable()
  
  addTask: function() {           
    var task, list, listItem;
    task = Todos.store.createRecord(Todos.Task,
      {title: "new task", "isDone":false, "order":1});
    this.pushObject(task);
    list = Todos.mainPage.getPath('mainPane.middleView.contentView');
    listItem = list.itemViewForContentIndex(list.length-1);
    if(listItem) {
      listItem.invokeLater(listItem.beginEditing, 200);
    } 
    return YES;
  }

}) ;
