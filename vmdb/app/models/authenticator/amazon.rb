module Authenticator
  class Amazon < Base
    def self.proper_name
      'Amazon IAM'
    end

    def self.validate_connection(config)
      errors = {}

      auth = config[:authentication]
      begin
        amazon_auth = new(auth)
        result = amazon_auth.admin_connect
      rescue Exception => err
        result = false
        errors[[:authentication, auth[:mode]].join("_")] = err.message
      else
        errors[[:authentication, auth[:mode]].join("_")] = "Authentication failed" unless result
      end

      return result, errors
    end

    def admin_connect
      @admin_iam ||=
        begin
          log_auth = VMDB::Config.clone_auth_for_log(config)
          _log.info("Server Settings: #{log_auth.inspect}")

          verify_credentials(config[:amazon_key], config[:amazon_secret])
          iam = aws_connect(config[:amazon_key], config[:amazon_secret])
          if iam_user?(iam)
            # FIXME: this is probably the wrong error category to raise
            raise MiqException::MiqHostError, "Access key #{config[:amazon_key]} belongs to IAM user, not to the AWS account holder."
          end
          iam
        end
    end

    def _authenticate(username, password, _request)
      return if password.blank?

      _log.info("Verifying IAM User: [#{username}]...")
      begin
        verify_credentials(username, password)
        iam = aws_connect(username, password)
        if iam_user?(iam)
          iam_user_for_access_key(username)
          true
        else
          _log.error("Verifying IAM User: [#{username}], Access key #{username} belongs to the AWS account holder, not to an IAM user.")
          false
        end
      rescue Exception => err
        _log.error("Verifying IAM User: [#{username}], '#{err.message}'")
        false
      end
    end

    def find_external_identity(username)
      # Amazon IAM will be used for authentication and role assignment
      _log.info("AWS key: [#{config[:amazon_key]}]")
      _log.info(" User: [#{username}]")
      amazon_user = iam_user_for_access_key(username)
      _log.debug("User obj from Amazon: #{amazon_user.inspect}")

      amazon_user
    end

    def groups_for(amazon_user)
      amazon_user.groups.collect(&:name)
    end

    def update_user_attributes(user, username, amazon_user)
      user.userid = username
      user.name   = amazon_user.name
    end

    private

    def iam_user_for_access_key(access_key_id)
      admin_connect.users.each do |user|
        user.access_keys.each do |access_key|
          return user if access_key.id == access_key_id
        end
      end
      raise MiqException::MiqHostError, "Access key #{access_key_id} does not match an IAM user for aws account holder."
    end

    def iam_user?(iam)
      # for AWS user, name will be nil; for IAM user, there will be a
      # name (if user has user/group management permissions), or
      # get_user will throw an exception (for less-privileged users)

      iam.client.get_user[:user][:user_name].present?
    rescue AWS::IAM::Errors::AccessDenied
      true
    end

    def verify_credentials(access_key_id, secret_access_key)
      begin
        aws_connect(access_key_id, secret_access_key, :EC2).regions.map(&:name)
      rescue AWS::EC2::Errors::SignatureDoesNotMatch
        raise MiqException::MiqHostError, "SignatureMismatch - check your AWS Secret Access Key and signing method"
      rescue AWS::EC2::Errors::AuthFailure
        raise MiqException::MiqHostError, "Login failed due to a bad username or password."
      rescue AWS::EC2::Errors::UnauthorizedOperation
        # user unauthorized for ec2, but still a valid IAM login
        return true
      rescue Exception => err
        _log.error("Error Class=#{err.class.name}, Message=#{err.message}")
        raise MiqException::MiqHostError, "Unexpected response returned from system, see log for details"
      end
      true
    end

    def aws_connect(access_key_id, secret_access_key, service = :IAM)
      require 'aws-sdk'

      AWS.const_get(service).new(
        :access_key_id     => access_key_id,
        :secret_access_key => secret_access_key,

        :logger            => $aws_log,
        :log_level         => :debug,
        :log_formatter     => AWS::Core::LogFormatter.new(AWS::Core::LogFormatter.default.pattern.chomp),
      )
    end
  end
end
