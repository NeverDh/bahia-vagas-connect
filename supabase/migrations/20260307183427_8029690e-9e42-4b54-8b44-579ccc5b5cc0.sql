
DROP TRIGGER IF EXISTS on_candidate_profile_created ON candidate_profiles;
DROP TRIGGER IF EXISTS on_company_created ON companies;

CREATE TRIGGER on_candidate_profile_created
  AFTER INSERT ON candidate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_role();

CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_role();
