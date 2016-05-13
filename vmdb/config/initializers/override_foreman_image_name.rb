module OverrideForemanConfigurationManagerForSatellite
  def image_name
    "satellite_configuration"
  end
end

ManageIQ::Providers::Foreman::ConfigurationManager.send(:prepend, OverrideForemanConfigurationManagerForSatellite)

module OverrideForemanProviderForSatellite
  def image_name
    "satellite"
  end
end

ManageIQ::Providers::Foreman::Provider.send(:prepend, OverrideForemanProviderForSatellite)
