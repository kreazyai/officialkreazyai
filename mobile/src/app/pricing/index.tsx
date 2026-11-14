// =====================================================================
// MODULE: PRICING & SUBSCRIPTION PAYMENT GATEWAY
// Inspired by kreazyai.com Official Website Pricing Suite
// Features USD/BDT/EUR Currencies, Annual Discount, & Direct Payment Gateway
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { AmbientGlassBackground } from '../../components/AmbientGlassBackground';
import { Header } from '../../components/Header';
import { FONTS } from '../../theme/typography';

type Currency = 'USD' | 'BDT' | 'EUR';
type BillingCycle = 'monthly' | 'annual';
type PaymentMethod = 'bkash' | 'nagad' | 'card';

interface Plan {
  id: string;
  name: string;
  badge?: string;
  usdMonthly: number;
  usdAnnual: number;
  bdtMonthly: number;
  bdtAnnual: number;
  eurMonthly: number;
  eurAnnual: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export default function PricingScreen() {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [trxId, setTrxId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter Plan',
      usdMonthly: 49,
      usdAnnual: 39,
      bdtMonthly: 5880,
      bdtAnnual: 4700,
      eurMonthly: 45,
      eurAnnual: 36,
      description: 'Ideal for emerging merchants automating their first WhatsApp store channel.',
      features: [
        '1,000 autonomous AI conversations / mo',
        '1 Connected WhatsApp Business account',
        'Real-time catalog & inventory sync',
        'Basic order capture & CRM storage',
        'Standard email & community support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      badge: 'Most Popular',
      isPopular: true,
      usdMonthly: 119,
      usdAnnual: 95,
      bdtMonthly: 14280,
      bdtAnnual: 11420,
      eurMonthly: 109,
      eurAnnual: 87,
      description: 'Built for scaling retail brands requiring multi-channel AI automation.',
      features: [
        '5,000 autonomous AI conversations / mo',
        'WhatsApp + Instagram + Messenger omnichannel',
        'Autonomous order placement & cart checkout',
        'AI sizing, discount & delivery advice',
        'Priority 24/7 AI Copilot support',
        'Dedicated webhook & Shopify/Woo sync'
      ]
    },
    {
      id: 'scale',
      name: 'Scale Plan',
      badge: 'High Volume',
      usdMonthly: 299,
      usdAnnual: 239,
      bdtMonthly: 35880,
      bdtAnnual: 28700,
      eurMonthly: 275,
      eurAnnual: 220,
      description: 'Enterprise-grade speed and custom fine-tuned agents for high-volume stores.',
      features: [
        '25,000 autonomous AI conversations / mo',
        'Unlimited social channels & team seats',
        'Custom fine-tuned AI prompts & catalog training',
        'Dedicated SLA & 99.9% uptime guarantee',
        'Dedicated customer success manager',
        'Custom ERP & payment gateway integrations'
      ]
    }
  ];

  const formatPrice = (plan: Plan) => {
    const isAnn = billingCycle === 'annual';
    if (currency === 'BDT') {
      const price = isAnn ? plan.bdtAnnual : plan.bdtMonthly;
      return `৳${price.toLocaleString()}`;
    }
    if (currency === 'EUR') {
      const price = isAnn ? plan.eurAnnual : plan.eurMonthly;
      return `€${price}`;
    }
    const price = isAnn ? plan.usdAnnual : plan.usdMonthly;
    return `$${price}`;
  };

  const handleOpenCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentModalVisible(true);
    setTrxId('');
  };

  const handleProcessSubscription = () => {
    if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim())) {
      Alert.alert('Payment Details', 'Please enter your credit card number and expiration date.');
      return;
    }
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      Alert.alert('Transaction ID Required', `Please enter your ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Transaction ID (TrxID) after completing the payment.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentModalVisible(false);
      Alert.alert(
        'Subscription Activated!',
        `Your ${selectedPlan?.name} has been activated successfully on ${paymentMethod.toUpperCase()}.\n\nWelcome to KreazyAI autonomous operations!`,
        [{ text: 'Go to Workspace', onPress: () => router.push('/(tabs)' as any) }]
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AmbientGlassBackground />
      <Header showBack title="Pricing & Plans" subtitle="kreazyai.com Official Plans" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Header */}
        <View style={styles.headerTitleBox}>
          <Text style={styles.mainTitle}>Simple pricing that pays for itself in captured sales</Text>
          <Text style={styles.mainSubtitle}>
            Choose the plan that fits your growth. Upgrade or adjust anytime as your message volume scales.
          </Text>
        </View>

        {/* Currency & Billing Cycle Toggles */}
        <View style={styles.togglesContainer}>
          {/* Currency Toggle */}
          <View style={styles.currencyToggle}>
            {(['USD', 'BDT', 'EUR'] as Currency[]).map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[styles.currencyBtn, currency === curr && styles.currencyBtnActive]}
                onPress={() => setCurrency(curr)}
                activeOpacity={0.8}
              >
                <Text style={[styles.currencyText, currency === curr && styles.currencyTextActive]}>
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Billing Cycle Toggle */}
          <View style={styles.cycleToggle}>
            <TouchableOpacity
              style={[styles.cycleBtn, billingCycle === 'monthly' && styles.cycleBtnActive]}
              onPress={() => setBillingCycle('monthly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.cycleText, billingCycle === 'monthly' && styles.cycleTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cycleBtn, billingCycle === 'annual' && styles.cycleBtnActive]}
              onPress={() => setBillingCycle('annual')}
              activeOpacity={0.8}
            >
              <Text style={[styles.cycleText, billingCycle === 'annual' && styles.cycleTextActive]}>
                Annual
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plans Cards */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.isPopular && styles.planCardPopular
                ]}
              >
                {/* Popular / High Volume Badge */}
                {plan.badge && (
                  <View style={styles.badgeWrapper}>
                    <View style={styles.topBadge}>
                      <Text style={styles.topBadgeText}>{plan.badge}</Text>
                    </View>
                  </View>
                )}

                <Text style={styles.planCardName}>{plan.name}</Text>
                <Text style={styles.planCardDesc}>{plan.description}</Text>

                {/* Price Display */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{formatPrice(plan)}</Text>
                  <Text style={styles.pricePeriod}>/ month</Text>
                </View>

                {billingCycle === 'annual' && (
                  <Text style={styles.annualBilledText}>Billed annually (Save 20%)</Text>
                )}

                {/* Subscribe CTA */}
                <TouchableOpacity
                  style={[
                    styles.subscribeBtn,
                    plan.isPopular && styles.subscribeBtnPopular
                  ]}
                  onPress={() => handleOpenCheckout(plan)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.subscribeBtnText}>
                    Subscribe via bKash / Card &rarr;
                  </Text>
                </TouchableOpacity>

                {/* Features Divider */}
                <View style={styles.featuresDivider} />

                {/* Features List */}
                <View style={styles.featuresList}>
                  {plan.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Feather name="check-circle" size={15} color="#FFFFFF" />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Security & Guarantee Note */}
        <View style={styles.securityFooter}>
          <Feather name="shield" size={16} color="#FFFFFF" />
          <Text style={styles.securityFooterText}>
            Instant activation &bull; Bank-grade SSL encryption &bull; Official bKash & Nagad Merchant
          </Text>
        </View>
      </ScrollView>

      {/* ================= SUBSCRIPTION PAYMENT GATEWAY MODAL ================= */}
      {selectedPlan && (
        <Modal
          visible={paymentModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPaymentModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <SafeAreaView style={styles.modalCard} edges={['bottom']}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Subscription Checkout</Text>
                  <Text style={styles.modalSubtitle}>KreazyAI Secure Payment Gateway</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setPaymentModalVisible(false)}
                >
                  <Feather name="x" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Selected Plan Summary Box */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryTop}>
                    <Text style={styles.summaryPlanName}>{selectedPlan.name}</Text>
                    <Text style={styles.summaryAmount}>{formatPrice(selectedPlan)}</Text>
                  </View>
                  <Text style={styles.summaryBilling}>
                    {billingCycle === 'annual' ? 'Billed annually with 20% discount' : 'Billed monthly'}
                  </Text>
                </View>

                {/* Payment Method Selector */}
                <Text style={styles.sectionLabel}>SELECT PAYMENT METHOD</Text>
                <View style={styles.paymentMethodsRow}>
                  <TouchableOpacity
                    style={[
                      styles.methodTab,
                      paymentMethod === 'bkash' && styles.methodTabActive
                    ]}
                    onPress={() => setPaymentMethod('bkash')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.methodTabText}>bKash</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodTab,
                      paymentMethod === 'nagad' && styles.methodTabActive
                    ]}
                    onPress={() => setPaymentMethod('nagad')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.methodTabText}>Nagad</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodTab,
                      paymentMethod === 'card' && styles.methodTabActive
                    ]}
                    onPress={() => setPaymentMethod('card')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.methodTabText}>Card</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Fields according to Method */}
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <View style={styles.mobilePaymentBox}>
                    <View style={styles.instructionBox}>
                      <Text style={styles.instructionTitle}>
                        Official {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Merchant:
                      </Text>
                      <Text style={styles.merchantNumber}>01643792804</Text>
                      <Text style={styles.instructionStep}>
                        1. Open your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} app & choose Payment{'\n'}
                        2. Send {formatPrice(selectedPlan)} to 01643792804{'\n'}
                        3. Copy the TrxID and paste it below:
                      </Text>
                    </View>

                    <Text style={styles.inputLabel}>Transaction ID (TrxID)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. BL92KJ89X"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      value={trxId}
                      onChangeText={setTrxId}
                      autoCapitalize="characters"
                    />
                  </View>
                )}

                {paymentMethod === 'card' && (
                  <View style={styles.cardPaymentBox}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="4242 4242 4242 4242"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      keyboardType="numeric"
                    />

                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>Expiry (MM/YY)</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="12/28"
                          placeholderTextColor="rgba(255, 255, 255, 0.45)"
                          value={cardExpiry}
                          onChangeText={setCardExpiry}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>CVC / CVV</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="123"
                          placeholderTextColor="rgba(255, 255, 255, 0.45)"
                          value={cardCvc}
                          onChangeText={setCardCvc}
                          keyboardType="numeric"
                          secureTextEntry
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Confirm Action Button */}
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleProcessSubscription}
                  disabled={isProcessing}
                  activeOpacity={0.85}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmBtnText}>
                      Confirm & Activate Subscription
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090D'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  headerTitleBox: {
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: 14
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 8
  },
  mainSubtitle: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320
  },
  togglesContainer: {
    marginVertical: 14,
    gap: 10,
    alignItems: 'center'
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  currencyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10
  },
  currencyBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)'
  },
  currencyText: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700'
  },
  currencyTextActive: {
    opacity: 1
  },
  cycleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center'
  },
  cycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10
  },
  cycleBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)'
  },
  cycleText: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700'
  },
  cycleTextActive: {
    opacity: 1
  },
  saveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  plansContainer: {
    gap: 16,
    marginTop: 8
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative'
  },
  planCardPopular: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1.5
  },
  badgeWrapper: {
    position: 'absolute',
    top: -12,
    right: 20
  },
  topBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  topBadgeText: {
    color: '#08080C',
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  planCardName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    marginBottom: 4
  },
  planCardDesc: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 17,
    marginBottom: 16
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4
  },
  priceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: FONTS.bold,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  pricePeriod: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: 13,
    fontFamily: FONTS.medium
  },
  annualBilledText: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 2,
    marginBottom: 14
  },
  subscribeBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)'
  },
  subscribeBtnPopular: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.45)'
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  featuresDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16
  },
  featuresList: {
    gap: 10
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    flex: 1
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16
  },
  securityFooterText: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 11,
    fontFamily: FONTS.regular,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: 'rgba(12, 12, 18, 0.98)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: 24,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  modalSubtitle: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  summaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryPlanName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONTS.bold,
    fontWeight: '900'
  },
  summaryBilling: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 4
  },
  sectionLabel: {
    color: '#FFFFFF',
    opacity: 0.55,
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  methodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  methodTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderColor: '#FFFFFF'
  },
  methodTabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  mobilePaymentBox: {
    marginBottom: 16
  },
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12
  },
  instructionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700'
  },
  merchantNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '900',
    marginVertical: 4,
    letterSpacing: 0.5
  },
  instructionStep: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 11,
    fontFamily: FONTS.regular,
    lineHeight: 16
  },
  cardPaymentBox: {
    marginBottom: 16
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginBottom: 6
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.medium
  },
  confirmBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    marginTop: 8,
    marginBottom: 20
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  }
});
