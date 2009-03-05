#!/usr/bin/env python
#
# Copyright 2008 Sprout Systems, Inc.
# 
# Released under MIT License

import wsgiref.handlers
import simplejson as json

from google.appengine.ext import webapp
from google.appengine.ext import db

class Task(db.Model):
  title = db.StringProperty(required=True)
  is_done = db.BooleanProperty()
  order = db.IntegerProperty() 

class ListHandler(webapp.RequestHandler):

  # Retrieve a list of all the tasks.
  def get(self, ext):

    # collect saved tasks
    tasks_json = []
    for task in Task.all():
      guid = "/tasks/%s.json" % task.key().id_or_name()
      task_json = { "guid": guid, "order": task.order, "title": task.title, "isDone": task.is_done, "type": "Task" }
      tasks_json.append(task_json)
      
    # replace into content 
    rec = { "content": tasks_json, "count": len(tasks_json), "self": "/tasks.json" }

    # Set the response content type and dump the json
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json.dumps(rec))

  # Create a new task
  def post(self, ext):
    
    # collect the data from the record
    rec = json.loads(self.request.body)
    if rec.has_key("content"):
      task_json = rec["content"]

      # Make sure we have all the required params
      defaults = { 'title': '(No title)', 'order': 1, 'isDone': False }
      for key in ['title','order','isDone']:
        if not task_json.has_key(key): task_json[key] = defaults[key]

      # Build Task
      task = Task(title=task_json["title"], order=task_json["order"], is_done=task_json["isDone"])
      task.put() # save
      
      guid = task.key().id_or_name()
      new_url = "/tasks/%s.json" % guid
      task_json["guid"] = new_url

      self.response.set_status(201, "Task created")
      self.response.headers['Location'] = new_url
      self.response.headers['Content-Type'] = 'text/json'
      self.response.out.write(json.dumps(rec))
    
    else:
      self.response.set_status(400, "Requires content")
    

class ItemHandler(webapp.RequestHandler):

  # retrieve the task with a given id
  def get(self, guid, ext):
    
    # find the matching task
    key = db.Key.from_path('Task', int(guid))
    task = db.get(key)
    if not task == None:
      guid = "/tasks/%s.json" % task.key().id_or_name()
      task_json = { "guid": guid, "order": task.order, "title": task.title, "isDone": task.is_done, "type": "Task" }

      rec = { "content": task_json, "self": guid }
      self.response.headers['Content-Type'] = 'application/json'
      self.response.out.write(json.dumps(rec))
    
    else:
      self.response.set_status(404, "Task not found")

  # Update an existing record
  def put(self, guid, ext):
    
    # find the matching task
    key = db.Key.from_path('Task', int(guid))
    task = db.get(key)
    if not task == None:

      # collect the data from the record
      rec = json.loads(self.request.body)
      if rec.has_key('content'):
        
        # update record with passed data.
        task_json = rec["content"]
        did_change = False

        if task_json.has_key('title'):
          task.title = task_json['title']
          did_change = True

        if task_json.has_key('order'):
          task.order = task_json['order']
          did_change = True

        if task_json.has_key('isDone'):
          task.is_done = task_json['isDone']
          did_change = True

        if did_change:
          task.put() # save
        
        # return the same record...
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(rec))
        
      else:
        self.response.set_status(400, "content required")
      
    else:
      self.response.set_status(404, "Task not found")

  # delete the task with a given id
  def delete(self, guid, ext):

    # find the matching task and delete it if found
    key = db.Key.from_path('Task', int(guid))
    task = db.get(key)
    if not task == None:
      task.delete()

def main():
  application = webapp.WSGIApplication([(r'/tasks(\.json)?$', ListHandler),
    (r'/tasks/([^\.]+)(\.json)?$', ItemHandler)],
                                       debug=True)
  wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
  main()
