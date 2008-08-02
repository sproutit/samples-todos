class Task
  include DataMapper::Resource

  property  :id,      Integer,    :serial => true
  property  :title,   String,     :nullable => false
  property  :is_done, Boolean,    :default => false 
  property  :order,   Integer

end
