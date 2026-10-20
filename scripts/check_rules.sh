#!/bin/sh
# Finds code that breaks MOBILE_RULES.md. Prints each hit; exits 1 when there is any.
cd "$(dirname "$0")/../src" || exit 1
found=0
check() {
  hits=$(grep -rnE "$2" --include=*.ts --include=*.tsx . | grep -vE "$3")
  if [ -n "$hits" ]; then
    echo "✗ $1"
    echo "$hits" | sed 's/^/    /'
    found=1
  fi
}
# Colors come from the theme tokens; printed slips (utils/print_*) are documents, not app UI.
check "Raw hex color (use a token)" "#[0-9a-fA-F]{3,8}\b" "^./utils/print_|^./global.css"
check "Raw palette class (use a token)" "(bg|text|border|accent)-(slate|gray|zinc|neutral|stone|red|rose|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|white|black)(-[0-9]+)?\b" "^$"
check "useRef / useMemo / useCallback / memo (the React Compiler does it)" "\buse(Ref|Memo|Callback)\(|\bmemo\(" "^$"
check "Parent import (use @/…)" "from '\.\./" "^$"
check "Named export (one default export per file)" "^export (const|function|class|let|var|interface|type) |^export \{" "^./app/|export default|^./uniwind-types.d.ts"
check "left/right in styles (use start/end)" "\b(left|right|marginLeft|marginRight|paddingLeft|paddingRight)\s*:|\b(ml|mr|pl|pr|left|right)-[0-9]" "^./utils/print_"
check "AsyncStorage (use utils/offline_db)" "AsyncStorage" "^$"
check "Old icon set (use ui/icon)" "@expo/vector-icons/(Feather|MaterialIcons|FontAwesome)|from '@expo/vector-icons'" "^$"
exit $found
