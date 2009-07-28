# ===========================================================================
# Project:   Todos
# Copyright: ©2009 My Company, Inc.
# ===========================================================================

# Add initial buildfile information here
config :all, :required => :sproutcore


proxy '/tasks', :to => 'localhost:4000'