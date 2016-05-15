module ManageIQ
  module Providers::Openstack
    module Regions
      REGIONS = {
        "ams5" => {
          :name        => "ams5",
          :description => "AMS5",
        },
        "ams6" => {
          :name        => "ams6",
          :description => "AMS6",
        },
      }

      def self.all
        REGIONS.values
      end

      def self.names
        REGIONS.keys
      end

      def self.find_by_name(name)
        REGIONS[name]
      end
    end
  end
end
