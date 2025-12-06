| object_type | schema | name                     | extra                                                     | cmd  | roles  | policy_def |
| ----------- | ------ | ------------------------ | --------------------------------------------------------- | ---- | ------ | ---------- |
| function    | public | sync_user_profile        | returns trigger                                           | null | null   | null       |
| policy      | public | guides → ENABLE ALL TEMP | null                                                      | ALL  | public | true       |
| table       | public | exports                  | column: created_at :: timestamp without time zone         | null | null   | null       |
| table       | public | exports                  | column: file_url :: text                                  | null | null   | null       |
| table       | public | exports                  | column: guide_id :: uuid                                  | null | null   | null       |
| table       | public | exports                  | column: id :: uuid                                        | null | null   | null       |
| table       | public | exports                  | column: status :: text                                    | null | null   | null       |
| table       | public | exports                  | column: type :: text                                      | null | null   | null       |
| table       | public | folders                  | column: created_at :: timestamp without time zone         | null | null   | null       |
| table       | public | folders                  | column: id :: uuid                                        | null | null   | null       |
| table       | public | folders                  | column: name :: text                                      | null | null   | null       |
| table       | public | folders                  | column: user_id :: uuid                                   | null | null   | null       |
| table       | public | guides                   | column: created_at :: timestamp without time zone         | null | null   | null       |
| table       | public | guides                   | column: description :: text                               | null | null   | null       |
| table       | public | guides                   | column: exported_docs :: jsonb                            | null | null   | null       |
| table       | public | guides                   | column: folder_id :: uuid                                 | null | null   | null       |
| table       | public | guides                   | column: id :: uuid                                        | null | null   | null       |
| table       | public | guides                   | column: slug :: text                                      | null | null   | null       |
| table       | public | guides                   | column: status :: text                                    | null | null   | null       |
| table       | public | guides                   | column: steps :: jsonb                                    | null | null   | null       |
| table       | public | guides                   | column: title :: text                                     | null | null   | null       |
| table       | public | guides                   | column: updated_at :: timestamp without time zone         | null | null   | null       |
| table       | public | guides                   | column: user_id :: uuid                                   | null | null   | null       |
| table       | public | guides                   | column: visibility :: text                                | null | null   | null       |
| table       | public | subscriptions            | column: current_period_end :: timestamp without time zone | null | null   | null       |
| table       | public | subscriptions            | column: id :: text                                        | null | null   | null       |
| table       | public | subscriptions            | column: max_editors :: integer                            | null | null   | null       |
| table       | public | subscriptions            | column: plan_type :: text                                 | null | null   | null       |
| table       | public | subscriptions            | column: status :: text                                    | null | null   | null       |
| table       | public | subscriptions            | column: stripe_customer_id :: text                        | null | null   | null       |
| table       | public | subscriptions            | column: user_id :: uuid                                   | null | null   | null       |
| table       | public | team_members             | column: created_at :: timestamp without time zone         | null | null   | null       |
| table       | public | team_members             | column: id :: uuid                                        | null | null   | null       |
| table       | public | team_members             | column: member_id :: uuid                                 | null | null   | null       |
| table       | public | team_members             | column: owner_id :: uuid                                  | null | null   | null       |
| table       | public | team_members             | column: role :: text                                      | null | null   | null       |
| table       | public | team_members             | column: status :: text                                    | null | null   | null       |
| table       | public | users                    | column: avatar_url :: text                                | null | null   | null       |
| table       | public | users                    | column: created_at :: timestamp with time zone            | null | null   | null       |
| table       | public | users                    | column: email :: text                                     | null | null   | null       |
| table       | public | users                    | column: name :: text                                      | null | null   | null       |
| table       | public | users                    | column: notification_preferences :: jsonb                 | null | null   | null       |
| table       | public | users                    | column: user_id :: uuid                                   | null | null   | null       |

Supabase tables
