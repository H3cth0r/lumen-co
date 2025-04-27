{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_23
    nodePackages.npm
    nodePackages.pnpm  # Optional but useful for SvelteKit
  ];

  shellHook = ''
    echo "Node.js development environment loaded"
    echo "Ready to develop SvelteKit projects"
    
    # Set up some helpful environment variables
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
}
