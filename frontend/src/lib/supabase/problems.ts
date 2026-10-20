import { ProblemCodeTemplate } from "@/types";
import { createClient } from "@/lib/supabase/client";

export async function fetchProblemCodeTemplate(
  problemId: number,
  language: string
): Promise<ProblemCodeTemplate | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("problem_code_templates")
    .select(
      "id, problem_id, language, starter_code, entry_class, entry_method, execution_mode, created_at, updated_at"
    )
    .eq("problem_id", problemId)
    .eq("language", language)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load the ${language} starter template: ${error.message}`);
  }

  return data;
}
