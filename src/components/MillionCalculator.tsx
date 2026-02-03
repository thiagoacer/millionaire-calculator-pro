import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TrendingUp, Calculator, Target, AlertTriangle, PartyPopper } from "lucide-react";
import { calculateYearsToMillion, determineScenario, getRatesByProfile } from "@/lib/calculator";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Zod Schema Definition
const calculatorSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  age: z.coerce.number().min(18, "Você deve ter pelo menos 18 anos").max(100, "Idade inválida"),
  currentInvestment: z.string().transform((val) => {
    return Number(val.replace(/\D/g, ""));
  }),
  monthlyInvestment: z.string().transform((val) => {
    return Number(val.replace(/\D/g, ""));
  }),
  profile: z.enum(["conservative", "aggressive"], {
    required_error: "Selecione um perfil",
  }),
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

interface CalculationResult {
  yearsReal: number;
  yearsOptimized: number;
  scenario: "iniciante" | "investidor";
  name: string;
}

const MillionCalculator = () => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<z.input<typeof calculatorSchema>>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      name: "",
      age: "" as any,
      currentInvestment: "0",
      monthlyInvestment: "0",
      profile: "conservative",
    },
  });

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const rawValue = e.target.value;
    const formatted = formatCurrency(rawValue);
    onChange(formatted);
  };

  const onSubmit = async (data: CalculatorFormValues) => {
    setIsCalculating(true);

    try {
      const { currentInvestment: pv, monthlyInvestment: pmt, profile, name, age } = data;
      const { realRate, optimizedRate } = getRatesByProfile(profile);

      const yearsReal = calculateYearsToMillion(pv, pmt, realRate);
      const yearsOptimized = calculateYearsToMillion(pv, pmt, optimizedRate);
      const scenario = determineScenario(pv, profile);

      // Salvar no Supabase
      const { error } = await supabase
        .from('calculations')
        .insert({
          name,
          age,
          current_investment: pv,
          monthly_investment: pmt,
          profile,
          years_real: yearsReal,
          years_optimized: yearsOptimized,
          scenario,
        });

      if (error) {
        console.error('Erro ao salvar cálculo:', error);
        toast.error('Não foi possível salvar o cálculo, mas você ainda pode ver os resultados!');
      } else {
        console.log('Cálculo salvo com sucesso!');
      }

      setResult({
        yearsReal,
        yearsOptimized,
        scenario,
        name,
      });

    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Ocorreu um erro, mas você ainda pode ver os resultados!');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 font-body">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent mb-6 border border-secondary/20 shadow-sm">
            <Target className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-medium text-foreground mb-4 tracking-tight">
            Calculadora do Milhão
          </h1>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
            Planejamento patrimonial para mulheres que valorizam exclusividade e retorno.
          </p>
        </div>

        {/* Calculator Form */}
        {!result && (
          <Card className="shadow-sm border border-border/60 bg-card/80 backdrop-blur-sm rounded-xl">
            <CardHeader className="pb-6 pt-8 px-8 border-b border-border/40">
              <CardTitle className="flex items-center gap-3 text-xl font-heading font-medium text-primary">
                <Calculator className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-medium">Seu Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Como gostaria de ser chamada?"
                            {...field}
                            className="h-12 bg-transparent border-x-0 border-t-0 border-b border-border/60 focus:border-secondary focus:ring-0 focus:ring-offset-0 px-0 rounded-none text-lg transition-all placeholder:text-muted-foreground/40"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Age */}
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-medium">Idade Atual</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 30"
                            {...field}
                            className="h-12 bg-transparent border-x-0 border-t-0 border-b border-border/60 focus:border-secondary focus:ring-0 focus:ring-offset-0 px-0 rounded-none text-lg transition-all placeholder:text-muted-foreground/40"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Current Investment */}
                  <FormField
                    control={form.control}
                    name="currentInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-medium">Quanto já tem investido? (R$)</FormLabel>
                        <FormControl>
                          <div className="flex items-center border-b border-border/60 focus-within:border-secondary transition-colors h-12">
                            <span className="text-muted-foreground/50 font-serif italic text-lg mr-3 mt-1">
                              R$
                            </span>
                            <Input
                              placeholder="0"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              className="h-full p-0 bg-transparent border-none focus:ring-0 focus:ring-offset-0 text-lg transition-all font-medium placeholder:text-muted-foreground/30 shadow-none -ml-1"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Monthly Investment */}
                  <FormField
                    control={form.control}
                    name="monthlyInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 font-medium">Quanto pode investir por mês? (R$)</FormLabel>
                        <FormControl>
                          <div className="flex items-center border-b border-border/60 focus-within:border-secondary transition-colors h-12">
                            <span className="text-muted-foreground/50 font-serif italic text-lg mr-3 mt-1">
                              R$
                            </span>
                            <Input
                              placeholder="0"
                              value={field.value}
                              onChange={(e) => handleCurrencyChange(e, field.onChange)}
                              className="h-full p-0 bg-transparent border-none focus:ring-0 focus:ring-offset-0 text-lg transition-all font-medium placeholder:text-muted-foreground/30 shadow-none -ml-1"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profile */}
                  <FormField
                    control={form.control}
                    name="profile"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-foreground/80 font-medium text-lg">Perfil de Investidor</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-4"
                          >
                            <FormItem>
                              <FormLabel className="font-normal w-full cursor-pointer">
                                <label
                                  htmlFor="conservative"
                                  className={`flex items-start gap-4 p-5 rounded-lg border transition-all duration-300 w-full hover:shadow-md ${field.value === "conservative"
                                    ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                                    : "border-border/60 bg-background hover:border-primary/20"
                                    }`}
                                >
                                  <FormControl>
                                    <RadioGroupItem value="conservative" id="conservative" className="mt-1 text-primary border-muted-foreground/40" />
                                  </FormControl>
                                  <div>
                                    <div className="font-heading font-medium text-lg text-foreground mb-1">Preservação de Capital</div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                      Prefiro segurança e previsibilidade. <br />
                                      <span className="text-primary/80 font-medium mt-1 inline-block">Renda Fixa (CDBs, Tesouro Direto e Fundos)</span>
                                    </div>
                                  </div>
                                </label>
                              </FormLabel>
                            </FormItem>
                            <FormItem>
                              <FormLabel className="font-normal w-full cursor-pointer">
                                <label
                                  htmlFor="aggressive"
                                  className={`flex items-start gap-4 p-5 rounded-lg border transition-all duration-300 w-full hover:shadow-md ${field.value === "aggressive"
                                    ? "border-secondary/50 bg-secondary/10 ring-1 ring-secondary/30"
                                    : "border-border/60 bg-background hover:border-secondary/30"
                                    }`}
                                >
                                  <FormControl>
                                    <RadioGroupItem value="aggressive" id="aggressive" className="mt-1 text-secondary border-muted-foreground/40" />
                                  </FormControl>
                                  <div>
                                    <div className="font-heading font-medium text-lg text-foreground mb-1">Construção de Patrimônio</div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                      Busco rentabilidade acima da média. <br />
                                      <span className="text-secondary/90 font-medium mt-1 inline-block">Ações, FIIs, Investimentos Globais</span>
                                    </div>
                                  </div>
                                </label>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full h-14 text-sm uppercase tracking-[0.15em] font-medium shadow-lg shadow-primary/5 hover:shadow-xl transition-all rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 mt-6"
                    size="lg"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-3">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Calculando Futuro...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 font-heading">
                        <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
                        PROJETAR MEU MILHÃO
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="shadow-sm border border-border/60 bg-card/80 backdrop-blur-sm rounded-xl">
              <CardContent className="pt-12 pb-12 px-8 text-center space-y-10">

                {/* Headline */}
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-heading font-medium text-primary tracking-tight">
                    {result.name}, o tempo é o único ativo que você não recupera.
                  </h2>
                </div>

                {/* Subheadline */}
                <p className="text-muted-foreground leading-relaxed text-lg max-w-lg mx-auto">
                  No cenário atual, sua liberdade financeira pode demorar{" "}
                  <span className="font-bold text-foreground text-xl font-heading border-b-2 border-primary/20">
                    {result.yearsReal.toFixed(1).replace(".", ",")} anos
                  </span>{" "}
                  para chegar.
                </p>

                {/* Box */}
                <div className="bg-secondary/10 rounded-lg p-8 border border-secondary/20 max-w-md mx-auto space-y-4">
                  <div className="flex items-center justify-center gap-2 text-secondary-foreground mb-1">
                    <PartyPopper className="w-4 h-4" />
                    <span className="font-medium uppercase tracking-wider text-[10px]">Oportunidade de Ajuste</span>
                  </div>
                  <p className="text-foreground/90 font-heading text-xl leading-snug">
                    Dependendo das escolhas certas, esse número pode cair para aproximadamente{" "}
                    <span className="font-bold text-primary">
                      {result.yearsOptimized.toFixed(1).replace(".", ",")} anos.
                    </span>
                  </p>
                  <div className="w-10 h-[1px] bg-secondary/30 mx-auto my-4" />
                  <p className="text-muted-foreground text-sm italic">
                    Mas isso exige um diagnóstico individual, não uma fórmula genérica.
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="https://wa.me/5511999999999?text=Quero%20meu%20diagnóstico%20financeiro%20gratuito"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full h-14 px-8 text-sm uppercase tracking-[0.15em] font-medium rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 hover:shadow-xl transition-all"
                >
                  Quero meu diagnóstico financeiro gratuito
                </a>

                {/* Recalculate */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setResult(null);
                  }}
                  className="text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-widest mt-4"
                >
                  Refazer Simulação
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center space-y-2 opacity-80">
          <p className="text-lg font-heading italic text-primary">
            Sarah Botelho
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Especialista em Finanças Pessoais
          </p>
        </div>
      </div>
    </div>
  );
};

export default MillionCalculator;
