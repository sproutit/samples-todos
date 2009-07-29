class Tasks < Application

only_provides :json
  def index
    tasks = Task.all.map { |task| json_for_task(task) }
    ret = { :content => tasks, :self => '/tasks' }
    display ret 
  end

def show
    task_id = params[:id]
    task = Task.get(task_id) rescue nil
    raise NotFound if task.nil?
    ret = { :content => json_for_task(task), :self => "/tasks/#{task_id}" }
    display ret
  end

def create

    json = JSON.parse(request.raw_post) rescue nil?
    json = json['content'] if json
    raise NotFound if json.nil?

    task = Task.new
    apply_json_to_task(task, json)
    task.save

    # Return the location header with the new URL
    url = headers['Location'] = "/tasks" 
    ret = { :content => json_for_task(task), :self => url }

    status = 201
    display ret
  end

def update

    json = JSON.parse(request.raw_post) rescue nil?
    json = json['content'] if json
    raise BadRequest if !json

    task_id = params[:id]
    task = Task.get(task_id) rescue nil
    raise NotFound if task.nil?

    # Update task
    apply_json_to_task(task, json)
    task.save

    # Return the updated JSON
    ret = { :content => json_for_task(task), :self => "/tasks/#{task_id}" }
    display ret
  end

def destroy
    task_id = params[:id]
    task = Task.get(task_id) rescue nil

    # if task was found destroy it.  If it was not found, do nothing
    task.destroy unless task.nil?

    "200 Destroyed" 
  end

protected

  def json_for_task(task)
    { :guid  => "/tasks/#{task.id}",
      :title => task.title,
      :order => task.order,
      :isDone => task.is_done }
  end

def apply_json_to_task(task, json_hash)
  task.title = json_hash['title'] unless json_hash['title'].nil?
  task.order = json_hash['order'] unless json_hash['order'].nil?
  task.is_done = json_hash['isDone'] unless json_hash['isDone'].nil?
end



end