class Task
  include DataMapper::Resource

  property  :id,      Serial
  property  :title,   String,     :nullable => false
  property  :is_done, Boolean,    :default => false 
  property  :order,   Integer

end