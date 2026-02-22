import EmailTemplate from "../models/EmailTemplate.js";

export const createTemplate = async (req, res) => {
  const { name, subject, blocks } = req.body;

  const template = await EmailTemplate.create({
    name,
    subject,
    blocks,
    createdBy: req.adminId,
  });

  res.json(template);
};


export const getTemplates = async (req, res) => {
  try {
    const filter =
      req.role === "superadmin"
        ? {}
        : { createdBy: req.adminId };

    const templates = await EmailTemplate.find(filter)
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    let filter = { _id: req.params.id };

    // If not superadmin → restrict to own templates
    if (req.role !== "superadmin") {
      filter.createdBy = req.adminId;
    }

    const template = await EmailTemplate.findOne(filter);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




