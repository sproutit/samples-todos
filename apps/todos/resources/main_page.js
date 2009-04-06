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
      borderStyle: SC.BORDER_BOTTOM
    }),
    
    middleView: SC.ScrollView.design({
      hasHorizontalScroller: NO,
      layout: { top: 42, bottom: 42, left: 0, right: 0 },
      backgroundColor: 'white'
    }),
    
    bottomView: SC.View.design(SC.Border, {
      layout: { bottom: 0, left: 0, right: 0, height: 41 },
      borderStyle: SC.BORDER_TOP
    })
  })

});
