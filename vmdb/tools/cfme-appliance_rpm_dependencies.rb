#!/usr/bin/env ruby

MAX_DEPTH = 4

def format_print(depth, data)
  prefix = ""
  depth.times { prefix << " | " }
  prefix << " +"
  puts "#{prefix} #{data}"
end

def get_rpm_requires( rpm_name )
  rpm_requires = %x( rpm -q --requires "#{rpm_name}" ).split("\n")
  rpm_requires.reject! { |item| item =~ /^\/|not installed|.so.|rpmlib|chkconfig|initscripts|GNU_HASH|ruby200-ruby |ruby200-ruby\(/i }
end

def loop_rpm_requires( depth, rpm_requires )
  return if depth == MAX_DEPTH

  rpm_requires.each do |rpm_require|
    rpm_require_name = rpm_require.split(" ")[0]
    format_print( depth, rpm_require )
    loop_rpm_requires( depth+1, get_rpm_requires( rpm_require_name ) )
  end

end

def print_rpm_requires_for( top_rpm_name )
  format_print(0 , %x( rpm -q #{top_rpm_name}))
  loop_rpm_requires( 0, [top_rpm_name] )
end

print_rpm_requires_for("cfme-appliance")
