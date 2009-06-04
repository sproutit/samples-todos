// ==========================================================================
// Project:   Todos - mainPage
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Todos */

// This page describes the main user interface for your application.  
Todos.mainPage = SC.Page.design({

  mainPane: SC.MainPane.design({
    childViews: 'topView middleView bottomView'.w(),
    
    topView: SC.View.design(SC.Border, {
      layout: { top: 0, left: 0, right: 0, height: 41 },
      childViews: 'labelView addButton deleteButton'.w(),
      borderStyle: SC.BORDER_BOTTOM,
      
      labelView: SC.LabelView.design({
        layout: { centerY: 0, height: 24, left: 8, width: 200 },
        controlSize: SC.LARGE_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        value:   'Todos'
      }),
      
      addButton: SC.ButtonView.design({
        layout: { centerY: 0, height: 21, right: 116, width: 100 },
       title:  "Add Task",
       target: "Todos.tasksController",
       action: "addTask"
      }),
      
      deleteButton: SC.ButtonView.design({
        layout: { centerY: 0, height: 21, right: 8, width: 100 },
       title:  "Delete Task",
       target: "Todos.tasksController",
       action: "deleteTask"
      })
      
    }),
    
    middleView: SC.ScrollView.design({
      hasHorizontalScroller: NO,
      layout: { top: 42, bottom: 42, left: 0, right: 0 },
      backgroundColor: 'white',

      contentView: SC.ListView.design({
        contentBinding: 'Todos.tasksController.arrangedObjects',
        selectionBinding: 'Todos.tasksController.selection',
        contentValueKey: "title",
        contentCheckboxKey: "isDone",
        canReorderContent: YES,
        canDeleteContent:YES,
        contentValueIsEditable: YES
      })
    }),
    
    bottomView: SC.View.design(SC.Border, {
      layout: { bottom: 0, left: 0, right: 0, height: 41 },
      childViews: 'summaryView'.w(),
      borderStyle: SC.BORDER_TOP,
      
      summaryView: SC.LabelView.design({
        layout: { centerY: 0, height: 18, left: 20, right: 20 },
        textAlign: SC.ALIGN_CENTER,
        
        valueBinding: "Todos.tasksController.summary"
      })
    })
  })

});
