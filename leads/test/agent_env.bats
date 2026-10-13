setup() {
  cd "$BATS_TEST_DIRNAME/.."
  ROSTER="$PWD/roster.tsv"
}

@test "agent-env prints exports for every agent on the roster" {
  while IFS= read -r name; do
    run mise run -q agent-env "$name"
    [ "$status" -eq 0 ]
    [[ "$output" == *"GIT_AUTHOR_NAME=$name"* ]]
    [[ "$output" == *"GIT_COMMITTER_EMAIL=$name@"* ]]
  done < <(awk -F '\t' '!/^#/ && NF { print $1 }' "$ROSTER")
}

@test "agent-env rejects an agent who is not on the roster" {
  run mise run -q agent-env nobody-here
  [ "$status" -ne 0 ]
}

@test "agent-env turns off commit and tag signing" {
  # Start from a shell with signing on and no inherited GIT_CONFIG_*, so the
  # test fails if agent-env stops turning signing off.
  unset GIT_CONFIG_COUNT GIT_CONFIG_KEY_0 GIT_CONFIG_VALUE_0 GIT_CONFIG_KEY_1 GIT_CONFIG_VALUE_1
  export HOME="$BATS_TEST_TMPDIR" XDG_CONFIG_HOME="$BATS_TEST_TMPDIR/.config" \
    GIT_CONFIG_GLOBAL="$BATS_TEST_TMPDIR/gitconfig" GIT_CONFIG_NOSYSTEM=1
  git config --global commit.gpgsign true
  git config --global tag.gpgsign true
  git config --global gpg.program false
  repo="$BATS_TEST_TMPDIR/repo"
  git init -q "$repo"
  run git -C "$repo" commit -q --allow-empty -m control
  [ "$status" -ne 0 ]

  eval "$(mise run -q agent-env "$(awk -F '\t' '!/^#/ && NF { print $1; exit }' "$ROSTER")")"
  git -C "$repo" commit -q --allow-empty -m signed-off
  [ "$(git -C "$repo" log -1 --format=%G?)" = "N" ]
  git -C "$repo" tag -a -m t t1
  ! git -C "$repo" cat-file tag t1 | grep -q 'BEGIN PGP'
}

@test "agent-env keeps GIT_CONFIG_* already in the shell" {
  export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/kept
  eval "$(mise run -q agent-env "$(awk -F '\t' '!/^#/ && NF { print $1; exit }' "$ROSTER")")"
  [ "$GIT_CONFIG_COUNT" = 3 ]
  [ "$(git config --get core.hooksPath)" = /kept ]
  [ "$(git config --get commit.gpgsign)" = false ]
}
