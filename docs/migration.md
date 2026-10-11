# Migration

Historical commits do not need to be rewritten: adopt gitsym going forward. Both tables are rough guides; pick the
type that describes the change, not just the old label.

## From Gitmoji

The mapping below covers every code of the official [Gitmoji](https://gitmoji.dev/) list (75 codes), each under its
closest gitsym symbol. It is a suggested equivalence, not a strict one. Codes of the older 48-code configurations that
have no direct equivalent (18 of the 48) go to `*`, or to the closest type.

| Gitmoji                                                                                                                                                                                                                                                                                 | gitsym                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `:sparkles:` `:globe_with_meridians:` `:rocket:` `:tada:` `:bricks:` `:heavy_plus_sign:` `:chart_with_upwards_trend:` `:loud_sound:` `:seedling:` `:triangular_flag_on_post:` `:egg:` `:stethoscope:` `:airplane:` `:bento:` `:package:` `:dizzy:` `:safety_vest:` `:money_with_wings:` | `+`                                         |
| `:fire:` `:wastebasket:` `:coffin:` `:heavy_minus_sign:` `:mute:`                                                                                                                                                                                                                       | `-`                                         |
| `:wrench:` `:zap:` `:technologist:` `:lipstick:` `:wheelchair:` `:children_crossing:` `:iphone:` `:speech_balloon:` `:necktie:` `:label:` `:thread:` `:card_file_box:` `:mag:` `:alien:` `:goal_net:` `:t-rex:`                                                                         | `~`                                         |
| `:bug:` `:ambulance:` `:adhesive_bandage:` `:rotating_light:` `:pencil2:`                                                                                                                                                                                                               | `!`                                         |
| `:recycle:` `:art:` `:green_heart:` `:building_construction:` `:white_check_mark:` `:construction_worker:` `:hammer:` `:camera_flash:` `:clown_face:` `:poop:`                                                                                                                          | `=`                                         |
| `:arrow_up:` `:arrow_down:` `:pushpin:`                                                                                                                                                                                                                                                 | `^`                                         |
| `:truck:`                                                                                                                                                                                                                                                                               | `>`                                         |
| `:rewind:`                                                                                                                                                                                                                                                                              | `<`                                         |
| `:memo:` `:bulb:` `:page_facing_up:` `:busts_in_silhouette:`                                                                                                                                                                                                                            | `@`                                         |
| `:lock:` `:closed_lock_with_key:` `:passport_control:`                                                                                                                                                                                                                                  | `$`                                         |
| `:alembic:` `:test_tube:` `:monocle_face:`                                                                                                                                                                                                                                              | `?`                                         |
| `:bookmark:` `:construction:` `:twisted_rightwards_arrows:` `:beers:` `:see_no_evil:`                                                                                                                                                                                                   | `*`                                         |
| `:boom:`                                                                                                                                                                                                                                                                                | `+!`, `~!` or `-!`, depending on the change |

## From Conventional Commits

These are rough equivalents; they are not defined in the sources. They cover every type of the Conventional Commits
specification and of the Angular convention.

| Conventional                    | gitsym                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `feat`                          | `+` (or `~` if it changes existing behavior)                                        |
| `fix`                           | `!`                                                                                 |
| `docs`                          | `@`                                                                                 |
| `refactor`, `style`, `test`     | `=`                                                                                 |
| `ci`, `build`                   | the type that describes the change (`+`, `~`, `=`), with the area as optional scope |
| `perf`                          | `~`                                                                                 |
| `chore(deps)`, `build(deps)`    | `^`                                                                                 |
| `chore` (removal)               | `-`                                                                                 |
| `chore` (other)                 | `*`                                                                                 |
| `revert`                        | `<`                                                                                 |
| `feat!`, `fix!`, ... (breaking) | `+!`, `~!` or `-!`; a breaking fix is reclassified                                  |
