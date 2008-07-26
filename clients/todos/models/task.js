// ==========================================================================
// Todos.Task
// ==========================================================================

require('core');

/** @class

  Tasks describe a single todo.  They have a title and a completion state 
  (isDone).

  @extends SC.Record
*/
Todos.Task = SC.Record.extend(
/** @scope Todos.Task.prototype */ {

  isDoneType: SC.Record.Bool

}) ;
