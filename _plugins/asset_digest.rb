module Jekyll
  module AssetDigest
    @@processed_assets = {}

    def asset_digest(input)
      site = @context.registers[:site]
      file_path = site.in_source_dir(input.sub(/^\//, ''))

      if File.exist?(file_path)
        content = File.read(file_path)
        hash = Digest::MD5.hexdigest(content)

        # Only log if we haven't seen this asset before or if the hash changed
        if @@processed_assets[input] != hash
          Jekyll.logger.info "AssetDigest", "Generated: #{input} => #{hash}"
          @@processed_assets[input] = hash
        end

        "#{input}?v=#{hash}"
      else
        input
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::AssetDigest)
