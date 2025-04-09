<div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
  {plans.map((plan) => (
    <motion.div
      key={plan.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: plan.tier === 'premium' ? 0.2 : 0 }}
      whileHover={{ y: -5 }}
      className="flex flex-col"
    >
      {/* 把 RECOMMENDED 放到卡片外面 */}
      {plan.tier === 'premium' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 text-sm font-medium rounded-t-xl">
          RECOMMENDED
        </div>
      )}
      <Card className={`overflow-hidden neo-card flex flex-col justify-between min-h-[600px] ${plan.tier === 'premium' ? 'gradient-border shadow-lg' : ''}`}>
        <CardHeader className="space-y-4 pb-6">
          <CardTitle className="text-2xl md:text-3xl">{plan.name}</CardTitle>
          <CardDescription className="text-base opacity-90">{plan.description}</CardDescription>
          <div className="mt-2 pt-2">
            <span className="text-4xl md:text-5xl font-bold">${plan.price}</span>
            {plan.price > 0 && <span className="text-muted-foreground ml-2">/month</span>}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-4">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                <span className="opacity-90">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-8">
          <Button 
            className={`w-full py-6 text-base font-medium btn-3d ${plan.tier === 'premium' ? 'bg-gradient-primary' : ''}`}
            variant={plan.tier === 'free' ? "outline" : "default"}
            onClick={() => handleSubscribe(plan.id)}
            disabled={isProcessing}
          >
            {plan.tier === 'free' ? 'Current Plan' : 'Subscribe'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  ))}
</div>
