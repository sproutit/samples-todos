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

  //isDoneType: SC.Record.Bool,
  
  recordDidChange: function() {
    if (!this.get('isCommitting')) {
      if (this.get('guid').slice(0,1) === '@') {
        if (this._tried>2 && (this.get('title') !== 'Untitled')) {
          Todos.serverController.createRecord(this) ;
        } else this._tried++ ;
      } else Todos.serverController.commitRecord(this) ;
    }
    
    sc_super();
  },
  
  isCommitting: NO,
  
  _tried: 0,
  
  recordDidDestroy: function() {
    if (!this.get('isDeleted')) return ;
    if (this._wasDestroyed) return ;
    this._wasDestroyed = YES ;
    if (this.get('guid').slice(0,1) !== '@') {
      Todos.serverController.destroyRecord(this) ;
    }
  }.observes('isDeleted') 

}) ;
