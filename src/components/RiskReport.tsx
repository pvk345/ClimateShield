"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #18181b",
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#71717a",
  },
  address: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
    marginBottom: 4,
    marginTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
    marginBottom: 10,
    borderBottom: "1px solid #e4e4e7",
    paddingBottom: 4,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 11,
    color: "#52525b",
  },
  scoreValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
  },
  tierBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 4,
  },
  tierText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    textAlign: "center",
  },
  explanation: {
    fontSize: 10,
    color: "#52525b",
    lineHeight: 1.6,
    marginBottom: 8,
  },
  footer: {
    marginTop: 32,
    borderTop: "1px solid #e4e4e7",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: "#a1a1aa",
    textAlign: "center",
  },
});

type Props = {
  address: string;
  wildfire: number;
  flood: number;
  composite: number;
  tier: string;
  zone: string;
};

function RiskPDF({ address, wildfire, flood, composite, tier, zone }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ClimateShield Risk Report</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString()} • Data: FEMA National Risk Index v1.20 (December 2025)
          </Text>
        </View>

        <Text style={styles.address}>{address}</Text>
        <Text style={{ fontSize: 10, color: "#71717a", marginBottom: 20 }}>{zone}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Scores</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Wildfire Risk</Text>
            <Text style={styles.scoreValue}>{wildfire} / 100</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Flood Risk</Text>
            <Text style={styles.scoreValue}>{flood} / 100</Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Composite Score</Text>
            <Text style={styles.scoreValue}>{composite} / 100</Text>
          </View>

          <View style={styles.tierBox}>
            <Text style={styles.tierText}>Risk Tier: {tier}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Explanation</Text>
          <Text style={styles.explanation}>
            Wildfire Risk ({wildfire}/100): {wildfire >= 75
              ? `${zone} has an extremely high wildfire hazard. The area has significant historical fire events and dangerous fire weather conditions.`
              : wildfire >= 50
              ? `${zone} has an elevated wildfire risk with periodic fire weather conditions.`
              : wildfire >= 25
              ? `${zone} has a moderate wildfire risk with lower historical fire frequency.`
              : `${zone} has a low wildfire risk based on historical data and climate patterns.`}
          </Text>
          <Text style={styles.explanation}>
            Flood Risk ({flood}/100): {flood >= 75
              ? `${zone} has an extremely high flood risk. The area is prone to significant flooding based on historical data and terrain.`
              : flood >= 50
              ? `${zone} has an elevated flood risk with periodic flooding events.`
              : flood >= 25
              ? `${zone} has a moderate flood risk during heavy rainfall events.`
              : `${zone} has a low flood risk with minimal historical flooding.`}
          </Text>
          <Text style={styles.explanation}>
            Overall Assessment: {tier === "Extreme"
              ? "This property is in an Extreme risk tier. Flood insurance is strongly recommended regardless of mortgage requirements."
              : tier === "High"
              ? "This property is in a High risk tier. Review insurance coverage carefully and consider additional protection measures."
              : tier === "Moderate"
              ? "This property is in a Moderate risk tier. Standard insurance coverage is likely sufficient."
              : "This property is in a Low risk tier with favorable natural hazard conditions."}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This report is based on FEMA National Risk Index county-level data and is intended for informational purposes only.
            It does not constitute professional insurance or real estate advice. Data source: FEMA NRI v1.20 (December 2025).
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default function DownloadReport({ address, wildfire, flood, composite, tier, zone }: Props) {
  return (
    <PDFDownloadLink
      document={<RiskPDF address={address} wildfire={wildfire} flood={flood} composite={composite} tier={tier} zone={zone} />}
      fileName={`climateshield-report-${address.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`}
    >
      {({ loading }) => (
        <button
          className="w-full h-12 rounded-full border border-zinc-700 bg-zinc-900 px-8 text-base font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Preparing report..." : "⬇ Download PDF Report"}
        </button>
      )}
    </PDFDownloadLink>
  );
}