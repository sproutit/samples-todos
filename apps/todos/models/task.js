// ==========================================================================
// Project:   Todos.Task
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Todos */

/** @class

  A single task on the todo list

  @extends SC.Record
  @version 0.1
*/
Todos.Task = SC.Record.extend(
/** @scope Todos.Task.prototype */ {

  isDone: SC.Record.attr(Boolean),
  description: SC.Record.attr(String)

}) ;
