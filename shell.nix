{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_22  # <--- CHANGE THIS LINE
    nodePackages.npm
    nodePackages.pnpm
  ];

  shellHook = ''
    echo "Node.js development environment loaded"
    echo "Ready to develop SvelteKit projects"
    
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
}
