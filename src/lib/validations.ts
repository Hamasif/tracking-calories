export const foodSchema = {
  name: "string",
  estimatedCalorie: "number",
  category: "string",
  imageUrl: "string",
} as const

export const mealLogSchema = {
  date: "string",
  mealType: "string",
  totalCalorie: "number",
} as const
