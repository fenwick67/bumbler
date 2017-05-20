# bumbler

A DIY barebones CMS for photos, audio, blog posts or whatever.

Runs as a local webserver, builds out to static files

## usage

* `npm install -g` it
* create a new folder and run `bumbler init` inside it
* run `bumbler --open` to view the admin interface for creating posts, reconfiguring, and publishing

## todo items

* warn before overwriting asset 
  - don't block, just prompt user "There is already a file named 'abc.jpg' {overwrite it} {rename my file} {cancel}"
* more asset types 
  - support STL
* edit posts via web interface
* permanently delete posts
* publish via git?  
* publish via scp?

### hosted features

* add a CLI flag for --serve (run web app with authentication)
  - this will entail a --gen-hash tool, in which you enter a username and password and it generates a bcrypt hash+username string
  - `bumbler --gen-hash`,`enter username`,`enter password`,`=> admin:$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa`
  - set as an env var (`BUMBLER_AUTH`?)
* subscribe to other feeds via Atom 
  - :star: and boost their posts
* support pingbacks?
