class Exceptions < Application
  
  # handle NotFound exceptions (404)
  def not_found
    "404 Not Found"
  end

  # handle NotAcceptable exceptions (406)
  def not_acceptable
    "406 Not Acceptable"
  end

end