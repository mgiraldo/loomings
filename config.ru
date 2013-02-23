use Rack::Static, 
  :urls => ["/stylesheets", "/images", "/js"],
  :root => "public"

map "/" do
  run lambda { |env|
    [
      200, 
      {
        'Content-Type'  => 'text/html', 
        'Cache-Control' => 'public, max-age=86400' 
      },
      File.open('public/index.html', File::RDONLY)
    ]
}

end

map "/favicon.ico" do
  run lambda { |env|
    [
      200, 
      {
        'Content-Type'  => 'image/html', 
        'Cache-Control' => 'public, max-age=86400' 
      },
      File.open('public/index.html', File::RDONLY)
    ]
}

end

map "/sizetest.html" do
  run lambda { |env|
    [
      200, 
      {
        'Content-Type'  => 'image/x-icon'
      },
      File.open('public/favicon.ico', File::RDONLY)
    ]
}

end