# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodePackages.firebase-tools
    pkgs.jdk17
    pkgs.unzip
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "dart-code.flutter"
      "dart-code.dart-code"
    ];
    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          # Example: run "flutter run -d web-server --web-port $PORT"
          command = ["flutter" "run" "--machine" "-d" "web-server" "--web-hostname" "0.0.0.0" "--web-port" "$PORT" "lib/main.dart"];
          cwd = "apps/finance_copilot";
          manager = "flutter";
        };
        android = {
          # Example: run "flutter run --machine -d android"
          command = ["flutter" "run" "--machine" "-d" "android" "-d" "localhost:5555" "lib/main.dart"];
          cwd = "apps/finance_copilot";
          manager = "flutter";
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        build-flutter = "cd apps/finance_copilot && flutter pub get";
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Example: start a background task to watch and re-compile
        # watch-backend = "npm run watch-backend";
      };
    };
  };
}
