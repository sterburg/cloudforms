class FileDepotFtpAnonymousRedhatDropbox < FileDepotFtpAnonymous
  default_values(
    :name => "Red Hat Dropbox",
    :uri  => "ftp://dropbox.redhat.com"
  )

  def requires_support_case?
    true
  end

  private

  def destination_file
    prefix    = support_case.to_s.presence.try(:shellescape)
    file_name = [prefix, file.destination_file_name].delete_blanks.join("-")
    File.join(destination_path, file_name)
  end
end
