# Sourced by scripts that send the Vibelab token. Sets VURL and refuses hosts outside Miro's Vibelab,
# so a stray VIBELAB_URL can't redirect the bearer token elsewhere.
VURL="${VIBELAB_URL:-https://vibelab.miro.tools}"
VURL="${VURL%/}"
if ! [[ "$VURL" =~ ^https://([a-z0-9-]+\.)*miro\.tools$ ]]; then
  echo "refusing VIBELAB_URL=$VURL: the Vibelab token is only sent to https://*.miro.tools" >&2
  exit 2
fi
