import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Container, Grid } from "@mui/material";
import { PlaceOutlined } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { H1, Paragraph } from "@/components/typography";
import { FlexBox } from "@/components/flexbox";
const Section1 = () => {
    return (_jsxs(Container, { maxWidth: "lg", children: [_jsx(H1, { mt: 10, fontSize: { sm: 52, xs: 42 }, children: "Explore Our World" }), _jsx(Paragraph, { mb: 8, fontSize: 18, color: "text.secondary", children: "We'd love to talk about how we can help you." }), _jsxs(Grid, { container: true, spacing: 5, children: [_jsx(Location, { country: "United States", address: _jsxs(_Fragment, { children: ["4100 Walcott Ave NE, ", _jsx("br", {}), " 87109, New York, USA. ", _jsx("br", {}), " (505) 855-5500 ", _jsx("br", {}), "info@onion.usa"] }) }), _jsx(Location, { country: "United Kingdom", address: _jsxs(_Fragment, { children: ["20 New Bond St ", _jsx("br", {}), "W1S 2UE, London, UK. ", _jsx("br", {}), "020 3214 9200 ", _jsx("br", {}), "info@onion.uk"] }) }), _jsx(Location, { country: "Canada", address: _jsxs(_Fragment, { children: ["118-1959 152 St ", _jsx("br", {}), "Surrey, British Columbia ", _jsx("br", {}), " V4A 9E3, Canada. ", _jsx("br", {}), "(604) 536-8244 ", _jsx("br", {}), "info@onion.canada"] }) }), _jsx(Location, { country: "Brazil", address: _jsxs(_Fragment, { children: ["Pra\u00E7a J\u00FAlio de Castilhos, 52 ", _jsx("br", {}), "Moinhos de Vento, Porto Alegre ", _jsx("br", {}), "90430-020, Brazil. ", _jsx("br", {}), "(51) 3312-2815 ", _jsx("br", {}), "info@onion.brazil"] }) })] })] }));
};
const Location = ({ country, address, }) => {
    return (_jsx(Grid, { item: true, lg: 3, sm: 6, xs: 12, children: _jsxs(FlexBox, { gap: 1, alignItems: "flex-start", children: [_jsx(PlaceOutlined, { sx: { color: "grey.500", fontSize: 25 } }), _jsxs("div", { children: [_jsx(Paragraph, { lineHeight: 1, fontSize: 20, fontWeight: 600, children: country }), _jsx(Paragraph, { mt: 2, fontSize: 16, color: "text.secondary", children: address })] })] }) }));
};
export default Section1;
