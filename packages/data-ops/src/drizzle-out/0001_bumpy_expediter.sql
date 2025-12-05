CREATE INDEX "exports_guideId_idx" ON "exports" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "folders_userId_idx" ON "folders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "guides_userId_idx" ON "guides" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "guides_folderId_idx" ON "guides" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "guides_slug_idx" ON "guides" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teamMembers_ownerId_idx" ON "team_members" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "teamMembers_memberId_idx" ON "team_members" USING btree ("member_id");