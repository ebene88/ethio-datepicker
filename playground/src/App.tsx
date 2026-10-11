import { EthioDatePicker } from "@/index";
import { FormProvider, useForm } from "react-hook-form";

export default function App() {
  const form = useForm({ defaultValues: { start: "" } });

  console.log("Form Values:", form.watch("start"));

  return (
    <FormProvider {...form}>
      <div style={{ margin: "2rem", maxWidth: 400 }}>
        <h1 style={{ color: "black" }}>Ethiopian Calendar Picker Demo</h1>
        <EthioDatePicker name="start" label="Start" showTime={true} />
      </div>
    </FormProvider>
  );
}
