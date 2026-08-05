import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import CustomCard from "../components/CustomCard";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import CustomAlert from "../components/CustomAlert";

import {
  useSubscriptionRequest,
  SYRIAN_GOVERNORATES,
} from "../hooks/useSubscriptionRequest";
import { theme } from "../theme/theme";

export default function SubscriptionRequestScreen({ navigation }) {
  const {
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    governorate,
    setGovernorate,
    detailedAddress,
    setDetailedAddress,
    isLoading,
    error,
    isSuccessModalVisible,
    successMessage,
    handleSubmit,
    handleCloseSuccess,
  } = useSubscriptionRequest();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardWrapper}>
            <CustomCard>
              <Text style={styles.brandTitle}>
                طلب اشتراك في خدمة BillCut 📝
              </Text>
              <Text style={styles.brandSubtitle}>
                سجّل بياناتك وسيتم التواصل معك لإتمام تركيب العداد وتزويدك
                ببيانات الحساب:
              </Text>

              <CustomAlert type="error" message={error} />

              <CustomInput
                label="الاسم الكامل للمشترك"
                placeholder="أدخل اسمك الثلاثي"
                value={fullName}
                onChangeText={setFullName}
              />

              <CustomInput
                label="رقم الهاتف الخلوي"
                placeholder="أدخل رقم هاتفك (مثال: 0987654321)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              {/* اختيار المحافظة عبر أزرار أفقية مرنة (Governorates Chips) */}
              <Text style={styles.pickerLabel}>المحافظة:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {SYRIAN_GOVERNORATES.map((gov) => {
                  const isSelected = gov === governorate;
                  return (
                    <TouchableOpacity
                      key={gov}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : "#E2E8F0",
                        },
                      ]}
                      onPress={() => setGovernorate(gov)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? "#FFFFFF" : theme.colors.text },
                        ]}
                      >
                        {gov}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <CustomInput
                label="العنوان التفصيلي والحي"
                placeholder="اكتب اسم الحي والشارع بالتفصيل..."
                value={detailedAddress}
                onChangeText={setDetailedAddress}
                multiline
                numberOfLines={3}
              />

              <CustomButton
                title={
                  isLoading ? "جاري إرسال الطلب..." : "إرسال طلب الاشتراك 🚀"
                }
                onPress={() => handleSubmit(navigation)}
                color={theme.colors.primary}
                disabled={isLoading}
              />

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.backBtnText}>
                  العودة لصفحة تسجيل الدخول
                </Text>
              </TouchableOpacity>
            </CustomCard>
          </View>
        </ScrollView>

        {/* Modal التنبيه بنجاح التقديم */}
        <Modal
          visible={isSuccessModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => handleCloseSuccess(navigation)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>تم تسجيل طلبك بنجاح! 🎉</Text>
              <Text style={styles.modalMsg}>{successMessage}</Text>
              <CustomButton
                title="تمام والعودة للدخول"
                onPress={() => handleCloseSuccess(navigation)}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  brandSubtitle: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  chipsRow: {
    paddingVertical: 4,
    marginBottom: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  backBtn: {
    marginTop: theme.spacing.md,
    alignSelf: "center",
  },
  backBtnText: {
    fontSize: 12.5,
    color: theme.colors.subtext,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.roundness,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.successText,
    marginBottom: theme.spacing.xs,
  },
  modalMsg: {
    fontSize: 12.5,
    color: theme.colors.text,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
});
