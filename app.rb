require 'sinatra'
require 'haml'
require 'sass'
require 'compass'

configure do
	Compass.configuration do |config|
		config.project_path = File.dirname(__FILE__)
    	config.sass_dir = 'views'
  end

  set :haml, { :format => :html5 }
  set :sass, Compass.sass_engine_options
  set :scss, Compass.sass_engine_options
end

get '/stylesheets/:name.css' do
	content_type 'text/css', :charset => 'utf-8'
	scss(:"stylesheets/scss/#{params[:name]}")
end

get '/' do
	File.open('public/index.html', File::RDONLY)
end