import { supabase } from "@/lib/supabaseClient"; // client version, bukan admin

const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  console.log(data);
  return data?.session?.access_token;
};

export default getToken;
