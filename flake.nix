{
  description = "darwin development environment";

  # Flake inputs
  inputs.nixpkgs.url = "nixpkgs/nixpkgs-unstable";

  # Flake outputs
  outputs = { self, nixpkgs }:
    let
      system = "aarch64-darwin";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.aarch64-darwin.default = pkgs.mkShell {
        # The Nix packages provided in the environment
        # Add any you need here
        packages = with pkgs; [
          biome
          deno
        ];

        # Set any environment variables for your dev shell
        env = { };

        # Add any shell logic you want executed any time the environment is activated
        shellHook = ''
          echo "Nix dev env!"
          echo "Deno version: $(deno -V)"
          echo "Biome version: $(biome --version)"
        '';
      };
    };
}
