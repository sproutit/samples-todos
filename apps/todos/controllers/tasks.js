// ==========================================================================
// Project:   Todos.tasksController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Todos */

/** @class

  Manages the tasks in the application

  @extends SC.ArrayController
  @extends SC.CollectionViewDelegate
*/
Todos.tasksController = SC.ArrayController.create(
  SC.CollectionViewDelegate,
  /** @scope Todos.tasksController.prototype */ {

  summary: function() {
    var len = this.get('length'), ret ;

    if (len && len > 0) {
      ret = len === 1 ? "1 task" : "%@ tasks".fmt(len);
    } else ret = "No tasks";

    return ret;
  }.property('length').cacheable(),
  
  collectionViewDeleteContent: function(view, content, indexes) {
    
    // destroy the records
    var records = indexes.map(function(idx) {
      return this.objectAt(idx);
    }, this);
    records.invoke('destroy');

    // set the new selection
    var selIndex = indexes.get('min')-1;
    if (selIndex<0) selIndex = 0 ;
    this.selectObject(this.objectAt(selIndex));
    
    return YES ;
  },
  
  addTask: function() {
    var task;

    // create new task and add it to the list
    task = Todos.store.createRecord(Todos.Task, { 
      description: "New Task", 
      isDone: false
    });

    // select new task in UI
    this.selectObject(task); 

    // activate inline editor once UI can repaint
    this.invokeLater(function() {
      var contentIndex = this.indexOf(task);
      var list = Todos.mainPage.getPath('mainPane.middleView.contentView');
      var listItem = list.itemViewForContentIndex(contentIndex);
      listItem.beginEditing();
    });

    return YES ;
  },

  toggleDone: function() {
    var sel = this.get('selection');
    sel.setEach('isDone', !sel.everyProperty('isDone'));
    return YES ;
  }

}) ;
