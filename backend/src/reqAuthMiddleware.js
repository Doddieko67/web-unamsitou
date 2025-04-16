import pkg from "@supabase/supabase-js";
import { supabase } from "../supabase.config.js";
const { SupabaseClient } = pkg;

export const getUserFromRequest = async (req, res, next) => {
  let authHeader = req.headers.authorization;
  console.log(req.headers);

  if (!authHeader) res.status(401).json({ message: "unauthorized" });

  const token = authHeader.split(" ")[1];

  let sessionsito = async () => supabase.auth.getSession();

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log(`Evento Supabase: ${event}`, session);
    },
  );

  let {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  const { data: other } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Evento Supabase 2: ${event}`, session);
  });

  console.log(user);
  if (error || !user) return next();
  req.user = user;

  next();
};
